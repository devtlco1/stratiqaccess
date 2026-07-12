import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unsubscribe — STRATIQ Access",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string; error?: string }>;
}) {
  const { token, done, error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      {done === "1" ? (
        <>
          <h1 className="font-display text-2xl text-navy">You&rsquo;re unsubscribed</h1>
          <p className="mt-3 text-sm text-ink/70">
            You will no longer receive emails from STRATIQ Access. If this was a mistake, contact us directly and we can restore your subscription.
          </p>
        </>
      ) : error ? (
        <>
          <h1 className="font-display text-2xl text-navy">Link no longer valid</h1>
          <p className="mt-3 text-sm text-ink/70">This unsubscribe link is invalid or has expired. Contact us directly if you&rsquo;d like to stop receiving emails.</p>
        </>
      ) : token ? (
        <>
          <h1 className="font-display text-2xl text-navy">Unsubscribe from STRATIQ Access emails?</h1>
          <p className="mt-3 text-sm text-ink/70">You will stop receiving outreach and update emails from partners@stratiqaccess.com.</p>
          <form action="/api/email/unsubscribe" method="POST" className="mt-6">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="rounded-md bg-stratiq-blue px-6 py-3 text-sm font-semibold text-white hover:bg-navy transition-colors"
            >
              Confirm Unsubscribe
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl text-navy">Missing unsubscribe link</h1>
          <p className="mt-3 text-sm text-ink/70">This page requires a valid unsubscribe link from one of our emails.</p>
        </>
      )}
    </div>
  );
}
