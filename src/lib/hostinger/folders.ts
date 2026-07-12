import { hostingerRequest } from "./client";
import type { HostingerFolder } from "./types";

export async function listFolders(mailboxResourceId: string): Promise<HostingerFolder[]> {
  return hostingerRequest<HostingerFolder[]>(`/api/v1/mailboxes/${mailboxResourceId}/folders`);
}

export async function createFolder(mailboxResourceId: string, name: string): Promise<HostingerFolder> {
  return hostingerRequest<HostingerFolder>(`/api/v1/mailboxes/${mailboxResourceId}/folders`, {
    method: "POST",
    body: { name },
  });
}

export async function updateFolder(mailboxResourceId: string, folder: string, name: string): Promise<HostingerFolder> {
  return hostingerRequest<HostingerFolder>(
    `/api/v1/mailboxes/${mailboxResourceId}/folders/${encodeURIComponent(folder)}`,
    { method: "PUT", body: { name } }
  );
}

export async function deleteFolder(mailboxResourceId: string, folder: string): Promise<void> {
  await hostingerRequest<void>(`/api/v1/mailboxes/${mailboxResourceId}/folders/${encodeURIComponent(folder)}`, {
    method: "DELETE",
  });
}
