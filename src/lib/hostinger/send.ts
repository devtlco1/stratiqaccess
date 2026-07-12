import { hostingerRequest } from "./client";
import { listFolders } from "./folders";
import { searchMessages } from "./messages";
import type { HostingerMessage, HostingerSendRequest } from "./types";

// Sends one email. NOTE: the Hostinger API returns 204 No Content on
// success — there is no message ID, no echo of what was sent, and the
// request body has no field for In-Reply-To/References/custom headers. This
// is a real, documented-by-omission limitation of the API (confirmed
// against the published OpenAPI spec), not an oversight here — see
// docs/EMAIL_CENTER.md. Callers that need to know the resulting Hostinger
// message/uid must use reconcileSentMessage() afterward, on a best-effort
// basis.
export async function sendEmail(mailboxResourceId: string, request: HostingerSendRequest): Promise<void> {
  await hostingerRequest<void>(`/api/v1/mailboxes/${mailboxResourceId}/send`, {
    method: "POST",
    body: request,
    timeoutMs: 20_000, // sends can be slower than reads, especially with attachments
  });
}

let cachedSentFolderPath: string | null = null;

async function getSentFolderPath(mailboxResourceId: string): Promise<string> {
  if (cachedSentFolderPath) return cachedSentFolderPath;
  const folders = await listFolders(mailboxResourceId);
  const sent = folders.find((f) => f.specialUse === "\\Sent") ?? folders.find((f) => f.name.toLowerCase() === "sent");
  cachedSentFolderPath = sent?.path ?? "INBOX.Sent";
  return cachedSentFolderPath;
}

// Best-effort correlation of a just-sent email with its Sent-folder copy, to
// recover a hostinger uid/messageId for our records. Matches by exact
// recipient + subject within a narrow time window. May return null (e.g. IMAP
// append lag) — callers must treat this as optional metadata, never as proof
// the send did or didn't happen, and must not retry the send based on this
// failing to find a match.
export async function reconcileSentMessage(
  mailboxResourceId: string,
  params: { recipient: string; subject: string; sentAfter: Date; windowMinutes?: number }
): Promise<HostingerMessage | null> {
  const sentFolder = await getSentFolderPath(mailboxResourceId);
  const windowMinutes = params.windowMinutes ?? 10;
  const since = new Date(params.sentAfter.getTime() - windowMinutes * 60_000);

  const { messages } = await searchMessages(
    mailboxResourceId,
    sentFolder,
    { to: params.recipient, subject: params.subject, since: since.toISOString().slice(0, 10) },
    { perPage: 20, sort: "-date" }
  );

  const match = messages.find((m) => {
    const messageDate = new Date(m.date);
    return messageDate.getTime() >= params.sentAfter.getTime() - 60_000 && m.to.some((to) => to.address.toLowerCase() === params.recipient.toLowerCase());
  });

  return match ?? null;
}
