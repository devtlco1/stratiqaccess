import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "pg";
import { randomUUID } from "crypto";

// Integration test against the REAL Postgres database (via DATABASE_URL) —
// exercises the actual claim_campaign_recipients() stored procedure
// (supabase/migrations/20260711130000_email_queue_claim_function.sql) to
// prove the FOR UPDATE SKIP LOCKED atomic claim genuinely prevents two
// concurrent "cron invocations" from claiming the same recipient — the
// specific failure mode that would cause a real duplicate send. Skips
// cleanly if DATABASE_URL isn't configured (e.g. CI without DB access)
// rather than failing the suite.
const DATABASE_URL = process.env.DATABASE_URL;

describe.skipIf(!DATABASE_URL)("claim_campaign_recipients — queue idempotency", () => {
  let campaignId: string;
  let contactIds: string[] = [];

  beforeAll(async () => {
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    const marker = `vitest-${randomUUID()}`;
    campaignId = randomUUID();
    contactIds = Array.from({ length: 5 }, () => randomUUID());

    await client.query(
      `insert into public.email_campaigns (id, name, status, subject_snapshot, html_snapshot, batch_size)
       values ($1, $2, 'sending', 'Test', '<p>Test</p>', 2)`,
      [campaignId, marker]
    );

    for (const contactId of contactIds) {
      await client.query(
        `insert into public.email_contacts (id, name, email) values ($1, $2, $3)`,
        [contactId, marker, `${contactId}@vitest-integration-test.invalid`]
      );
      await client.query(
        `insert into public.email_campaign_recipients (campaign_id, contact_id, email_snapshot, status)
         values ($1, $2, $3, 'pending')`,
        [campaignId, contactId, `${contactId}@vitest-integration-test.invalid`]
      );
    }

    await client.end();
  });

  afterAll(async () => {
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    await client.query(`delete from public.email_campaigns where id = $1`, [campaignId]); // cascades recipients
    await client.query(`delete from public.email_contacts where id = any($1::uuid[])`, [contactIds]);
    await client.end();
  });

  it("never lets two concurrent claims return overlapping recipients", async () => {
    const clientA = new Client({ connectionString: DATABASE_URL });
    const clientB = new Client({ connectionString: DATABASE_URL });
    await Promise.all([clientA.connect(), clientB.connect()]);

    try {
      const [resultA, resultB] = await Promise.all([
        clientA.query(`select * from public.claim_campaign_recipients($1, 2, 'session-A')`, [campaignId]),
        clientB.query(`select * from public.claim_campaign_recipients($1, 2, 'session-B')`, [campaignId]),
      ]);

      const claimedA = resultA.rows.map((r) => r.id);
      const claimedB = resultB.rows.map((r) => r.id);
      const overlap = claimedA.filter((id) => claimedB.includes(id));

      expect(overlap).toEqual([]);
      expect(claimedA.length).toBeLessThanOrEqual(2);
      expect(claimedB.length).toBeLessThanOrEqual(2);
      expect(claimedA.length + claimedB.length).toBe(4); // 2 batches of 2, out of 5 available

      // Every claimed row must have actually transitioned to "sending".
      const allClaimed = [...claimedA, ...claimedB];
      const check = await clientA.query(`select status from public.email_campaign_recipients where id = any($1::uuid[])`, [allClaimed]);
      expect(check.rows.every((r) => r.status === "sending")).toBe(true);
    } finally {
      await clientA.end();
      await clientB.end();
    }
  });

  it("leaves the remaining recipient pending and lets a third claim pick it up", async () => {
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    try {
      const result = await client.query(`select * from public.claim_campaign_recipients($1, 2, 'session-C')`, [campaignId]);
      // Exactly 1 should remain (5 total - 4 claimed by the previous test).
      expect(result.rows.length).toBe(1);
    } finally {
      await client.end();
    }
  });
});
