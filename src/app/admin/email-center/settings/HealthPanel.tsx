"use client";

import { useState } from "react";
import { testHostingerConnection, registerOrRotateWebhook, type ConnectionTestResult, type WebhookRegistrationResult } from "./actions";

export function HealthPanel({
  tokenConfigured,
  webhookSecretConfigured,
  lastSyncStatus,
  lastSyncAt,
  lastWebhookAt,
  webhookRegisteredOnHostinger,
}: {
  tokenConfigured: boolean;
  webhookSecretConfigured: boolean;
  lastSyncStatus: string | null;
  lastSyncAt: string | null;
  lastWebhookAt: string | null;
  webhookRegisteredOnHostinger: boolean;
}) {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const [webhookResult, setWebhookResult] = useState<WebhookRegistrationResult | null>(null);
  const [webhookLoading, setWebhookLoading] = useState(false);

  async function runTest() {
    setTestLoading(true);
    try {
      setTestResult(await testHostingerConnection());
    } finally {
      setTestLoading(false);
    }
  }

  async function runWebhookRegistration() {
    if (!window.confirm("Register/rotate the Hostinger webhook? If a webhook secret already exists, this generates a new one and you must update HOSTINGER_WEBHOOK_SECRET immediately.")) return;
    setWebhookLoading(true);
    try {
      setWebhookResult(await registerOrRotateWebhook());
    } finally {
      setWebhookLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-base text-navy">Connection Health</h2>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <StatusRow label="API token configured" ok={tokenConfigured} />
          <StatusRow label="Webhook secret configured" ok={webhookSecretConfigured} />
          <StatusRow label="Webhook registered on Hostinger" ok={webhookRegisteredOnHostinger} />
          <div className="flex items-center justify-between">
            <dt className="text-ink/60">Last webhook received</dt>
            <dd className="text-ink/80">{lastWebhookAt ? new Date(lastWebhookAt).toLocaleString() : "never"}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink/60">Last connection test</dt>
            <dd className="text-ink/80">
              {lastSyncAt ? `${new Date(lastSyncAt).toLocaleString()} (${lastSyncStatus})` : "never run"}
            </dd>
          </div>
        </dl>
        <button
          onClick={runTest}
          disabled={testLoading}
          className="mt-4 rounded-md bg-stratiq-blue px-4 py-2 text-sm font-semibold text-white hover:bg-navy transition-colors disabled:opacity-60"
        >
          {testLoading ? "Testing…" : "Test Connection"}
        </button>
        {testResult && (
          <p className={`mt-3 text-sm ${testResult.ok ? "text-green-700" : "text-red-700"}`}>
            {testResult.ok
              ? `Connected to ${testResult.mailboxAddress} — ${testResult.quotaUsedMb}MB / ${testResult.quotaLimitMb}MB used.`
              : testResult.error}
          </p>
        )}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-base text-navy">Webhook</h2>
        <p className="mt-2 text-xs text-ink/60">
          Registers a webhook on Hostinger pointed at this deployment&rsquo;s <code>/api/webhooks/hostinger-email</code> endpoint. The
          secret is shown once — copy it into <code>HOSTINGER_WEBHOOK_SECRET</code> immediately.
        </p>
        <button
          onClick={runWebhookRegistration}
          disabled={webhookLoading}
          className="mt-4 rounded-md border border-navy/15 px-4 py-2 text-sm font-semibold text-navy hover:bg-paper transition-colors disabled:opacity-60"
        >
          {webhookLoading ? "Working…" : "Register / Rotate Webhook"}
        </button>
        {webhookResult && (
          <div className="mt-3">
            {webhookResult.ok ? (
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-800">New secret (shown once — copy now):</p>
                <code className="mt-1 block break-all text-xs text-amber-900">{webhookResult.secret}</code>
              </div>
            ) : (
              <p className="text-sm text-red-700">{webhookResult.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink/60">{label}</dt>
      <dd className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {ok ? "OK" : "Not configured"}
      </dd>
    </div>
  );
}
