import { openMailboxMessage } from "../actions";

// Thin resolver: takes a live folder+uid (as browsed straight from the
// Hostinger API on the inbox list page), syncs it into our thread model,
// and redirects into the conversation view. No UI of its own.
export default async function OpenMailboxMessagePage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; uid?: string }>;
}) {
  const { folder, uid } = await searchParams;
  if (!folder || !uid) {
    return <p className="p-8 text-sm text-red-700">Missing folder or message id.</p>;
  }

  await openMailboxMessage(folder, Number(uid));
  return null;
}
