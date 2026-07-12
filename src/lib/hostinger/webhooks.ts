import { hostingerRequest } from "./client";
import type {
  HostingerWebhook,
  HostingerWebhookCreateRequest,
  HostingerWebhookTestResult,
  HostingerWebhookUpdateRequest,
  HostingerWebhookWithSecret,
} from "./types";

function webhooksPath(mailboxResourceId: string): string {
  return `/api/v1/mailboxes/${mailboxResourceId}/webhooks`;
}

export async function listWebhooks(mailboxResourceId: string): Promise<HostingerWebhook[]> {
  return hostingerRequest<HostingerWebhook[]>(webhooksPath(mailboxResourceId));
}

export async function createWebhook(
  mailboxResourceId: string,
  request: HostingerWebhookCreateRequest
): Promise<HostingerWebhookWithSecret> {
  return hostingerRequest<HostingerWebhookWithSecret>(webhooksPath(mailboxResourceId), {
    method: "POST",
    body: request,
  });
}

export async function getWebhook(mailboxResourceId: string, webhookId: string): Promise<HostingerWebhook> {
  return hostingerRequest<HostingerWebhook>(`${webhooksPath(mailboxResourceId)}/${webhookId}`);
}

export async function updateWebhook(
  mailboxResourceId: string,
  webhookId: string,
  request: HostingerWebhookUpdateRequest
): Promise<HostingerWebhook> {
  return hostingerRequest<HostingerWebhook>(`${webhooksPath(mailboxResourceId)}/${webhookId}`, {
    method: "PATCH",
    body: request,
  });
}

export async function deleteWebhook(mailboxResourceId: string, webhookId: string): Promise<void> {
  await hostingerRequest<void>(`${webhooksPath(mailboxResourceId)}/${webhookId}`, { method: "DELETE" });
}

export async function regenerateWebhookSecret(mailboxResourceId: string, webhookId: string): Promise<HostingerWebhookWithSecret> {
  return hostingerRequest<HostingerWebhookWithSecret>(`${webhooksPath(mailboxResourceId)}/${webhookId}/regenerate-secret`, {
    method: "POST",
  });
}

export async function testWebhook(mailboxResourceId: string, webhookId: string): Promise<HostingerWebhookTestResult> {
  return hostingerRequest<HostingerWebhookTestResult>(`${webhooksPath(mailboxResourceId)}/${webhookId}/test`, {
    method: "POST",
  });
}
