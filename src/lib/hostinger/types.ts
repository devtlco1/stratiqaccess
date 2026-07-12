// Typed mirror of the Hostinger Mail API OpenAPI spec (v1.0.2,
// https://api.mail.hostinger.com/openapi/openapi.json), pulled directly from
// the published spec — not guessed. Only the fields/endpoints this app
// actually uses are modeled; see docs/EMAIL_CENTER.md for the full endpoint
// list and the documented gaps (no message ID returned from send, no
// reply/forward endpoint, no In-Reply-To/References support, undocumented
// webhook payload shape).

export interface HostingerErrorBody {
  error: string;
  code: string;
  params?: Record<string, unknown>;
}

export class HostingerApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly params?: Record<string, unknown>;

  constructor(status: number, body: HostingerErrorBody) {
    super(body.error);
    this.name = "HostingerApiError";
    this.status = status;
    this.code = body.code;
    this.params = body.params;
  }
}

export interface HostingerPagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface HostingerMailbox {
  resourceId: string;
  address: string;
}

export interface HostingerAccount {
  orderResourceId: string;
  mailboxes: HostingerMailbox[];
}

export interface HostingerMessageAddress {
  name: string;
  address: string;
}

export interface HostingerMessageAttachment {
  id: string;
  contentType: string;
  sizeBytes: number;
  inline: boolean;
  filename: string | null;
  contentId: string | null;
}

export interface HostingerMessage {
  uid: number;
  path: string;
  date: string;
  flags: string[];
  unseen: boolean;
  size: number;
  subject: string | null;
  from: HostingerMessageAddress | null;
  to: HostingerMessageAddress[];
  cc: HostingerMessageAddress[];
  bcc: HostingerMessageAddress[];
  messageId: string | null;
  inReplyTo: string | null;
  attachments: HostingerMessageAttachment[];
}

export interface HostingerMessageText {
  text: string;
  html: string;
}

export interface HostingerFolder {
  path: string;
  name: string;
  delimiter: string;
  specialUse: string | null;
  messageCount: number;
  unreadCount: number;
}

export interface HostingerQuotaResource {
  resource: string;
  usage: number;
  limit: number;
  percentage: number;
}

export interface HostingerQuota {
  quotas: HostingerQuotaResource[];
  totalUsage: number;
  totalLimit: number;
  totalPercentage: number;
  supported: boolean;
}

export interface HostingerSendAttachment {
  filename: string;
  content: string; // base64 by default
  contentType?: string;
  cid?: string;
  encoding?: string;
}

export interface HostingerSendRequest {
  to?: string[];
  displayName?: string;
  cc?: string[];
  bcc?: string[];
  subject?: string;
  text?: string;
  html?: string;
  attachments?: HostingerSendAttachment[];
}

export type HostingerWebhookStatus = "active" | "paused" | "disabled";
export type HostingerWebhookEvent = "message.received";

export interface HostingerWebhook {
  id: string;
  accountResourceId: string;
  mailbox: string;
  name: string;
  description: string | null;
  events: HostingerWebhookEvent[];
  status: HostingerWebhookStatus;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostingerWebhookWithSecret extends HostingerWebhook {
  secret: string;
}

export interface HostingerWebhookCreateRequest {
  name: string;
  description?: string | null;
  events: HostingerWebhookEvent[];
  status?: HostingerWebhookStatus;
  url: string;
}

export interface HostingerWebhookUpdateRequest {
  name?: string;
  description?: string | null;
  events?: HostingerWebhookEvent[];
  status?: HostingerWebhookStatus;
  url?: string;
}

export interface HostingerWebhookTestResult {
  httpStatus: number;
  success?: boolean;
  error?: string | null;
}

export interface HostingerSearchCriteria {
  since?: string;
  before?: string;
  flags?: string[];
  uid?: string;
  subject?: string;
  from?: string;
  to?: string;
  cc?: string;
  body?: string;
  header?: string;
  larger?: number;
  smaller?: number;
  text?: string;
}

export interface HostingerUpdateFlagsResult {
  successful: number[];
  failed: { uid: number; reason: string }[];
}

export interface ListMessagesParams {
  page?: number;
  perPage?: number;
  sort?: string; // e.g. "-uid" (default), "date", "-date", "size"
}
