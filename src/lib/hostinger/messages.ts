import { hostingerRequest, hostingerRequestPaginated } from "./client";
import type {
  HostingerMessage,
  HostingerMessageText,
  HostingerPagination,
  HostingerSearchCriteria,
  HostingerUpdateFlagsResult,
  ListMessagesParams,
} from "./types";

function messagesPath(mailboxResourceId: string, folder: string): string {
  return `/api/v1/mailboxes/${mailboxResourceId}/folders/${encodeURIComponent(folder)}/messages`;
}

export async function listMessages(
  mailboxResourceId: string,
  folder: string,
  params: ListMessagesParams = {}
): Promise<{ messages: HostingerMessage[]; pagination: HostingerPagination }> {
  const { data, pagination } = await hostingerRequestPaginated<HostingerMessage[]>(messagesPath(mailboxResourceId, folder), {
    query: { page: params.page, perPage: params.perPage, sort: params.sort },
  });
  return { messages: data, pagination };
}

export async function getMessage(mailboxResourceId: string, folder: string, uid: number): Promise<HostingerMessage> {
  return hostingerRequest<HostingerMessage>(`${messagesPath(mailboxResourceId, folder)}/${uid}`);
}

export async function getMessageText(mailboxResourceId: string, folder: string, uid: number): Promise<HostingerMessageText> {
  return hostingerRequest<HostingerMessageText>(`${messagesPath(mailboxResourceId, folder)}/${uid}/text`);
}

export async function getMessageSource(mailboxResourceId: string, folder: string, uid: number): Promise<ArrayBuffer> {
  return hostingerRequest<ArrayBuffer>(`${messagesPath(mailboxResourceId, folder)}/${uid}/source`, { raw: true });
}

export async function getMessageAttachment(
  mailboxResourceId: string,
  folder: string,
  uid: number,
  attachmentId: string
): Promise<ArrayBuffer> {
  return hostingerRequest<ArrayBuffer>(
    `${messagesPath(mailboxResourceId, folder)}/${uid}/attachments/${encodeURIComponent(attachmentId)}`,
    { raw: true }
  );
}

export async function searchMessages(
  mailboxResourceId: string,
  folder: string,
  criteria: HostingerSearchCriteria,
  params: ListMessagesParams = {}
): Promise<{ messages: HostingerMessage[]; pagination: HostingerPagination }> {
  const { data, pagination } = await hostingerRequestPaginated<HostingerMessage[]>(
    `${messagesPath(mailboxResourceId, folder)}/search`,
    { method: "POST", body: criteria, query: { page: params.page, perPage: params.perPage, sort: params.sort } }
  );
  return { messages: data, pagination };
}

export async function updateMessageFlags(
  mailboxResourceId: string,
  folder: string,
  uid: number,
  flags: { addFlags?: string[]; removeFlags?: string[] }
): Promise<void> {
  await hostingerRequest<void>(`${messagesPath(mailboxResourceId, folder)}/${uid}`, { method: "PATCH", body: flags });
}

export async function bulkUpdateMessageFlags(
  mailboxResourceId: string,
  folder: string,
  uids: number[],
  flags: { addFlags?: string[]; removeFlags?: string[] }
): Promise<HostingerUpdateFlagsResult> {
  return hostingerRequest<HostingerUpdateFlagsResult>(`${messagesPath(mailboxResourceId, folder)}/flags`, {
    method: "POST",
    body: { uids, ...flags },
  });
}

export async function markRead(mailboxResourceId: string, folder: string, uid: number): Promise<void> {
  return updateMessageFlags(mailboxResourceId, folder, uid, { addFlags: ["\\Seen"] });
}

export async function markUnread(mailboxResourceId: string, folder: string, uid: number): Promise<void> {
  return updateMessageFlags(mailboxResourceId, folder, uid, { removeFlags: ["\\Seen"] });
}

export async function moveMessage(mailboxResourceId: string, folder: string, uid: number, targetFolder: string): Promise<void> {
  await hostingerRequest<void>(`${messagesPath(mailboxResourceId, folder)}/${uid}/move`, {
    method: "POST",
    body: { targetFolder },
  });
}

export async function bulkMoveMessages(
  mailboxResourceId: string,
  folder: string,
  uids: number[],
  targetFolder: string
): Promise<void> {
  await hostingerRequest<void>(`${messagesPath(mailboxResourceId, folder)}/move`, {
    method: "POST",
    body: { uids, targetFolder },
  });
}

export async function deleteMessage(mailboxResourceId: string, folder: string, uid: number): Promise<void> {
  await hostingerRequest<void>(`${messagesPath(mailboxResourceId, folder)}/${uid}`, { method: "DELETE" });
}

export async function bulkDeleteMessages(mailboxResourceId: string, folder: string, uids: number[]): Promise<void> {
  await hostingerRequest<void>(`${messagesPath(mailboxResourceId, folder)}/delete`, { method: "POST", body: { uids } });
}
