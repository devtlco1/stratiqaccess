// Row types for the Email Center tables (supabase/migrations/20260711120000_email_center_core_schema.sql).
// Mirrors the DB schema field-for-field — keep in sync when migrations change.

export type ContactSource = "manual" | "import_customers" | "import_messages" | "csv_import" | "xlsx_import" | "paste_import" | "api";
export type ContactStatus = "active" | "unsubscribed" | "bounced" | "suppressed" | "archived";

export interface EmailContactRow {
  id: string;
  name: string;
  company_name: string | null;
  email: string;
  email_normalized: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  sector: string | null;
  job_title: string | null;
  website: string | null;
  source: ContactSource;
  source_customer_id: string | null;
  source_message_id: string | null;
  language: string | null;
  notes: string | null;
  tags: string[];
  status: ContactStatus;
  is_subscribed: boolean;
  unsubscribed_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailContactListRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailContactListMemberRow {
  id: string;
  list_id: string;
  contact_id: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateRow {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  html_body: string;
  text_body: string | null;
  default_language: string;
  variables: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailAttachmentRow {
  id: string;
  storage_bucket: string;
  storage_path: string;
  filename: string;
  content_type: string | null;
  size_bytes: number | null;
  checksum_sha256: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateAttachmentRow {
  id: string;
  template_id: string;
  attachment_id: string;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus = "draft" | "scheduled" | "sending" | "paused" | "completed" | "cancelled" | "failed";

export interface EmailCampaignRow {
  id: string;
  name: string;
  description: string | null;
  template_id: string | null;
  subject_snapshot: string;
  html_snapshot: string;
  text_snapshot: string | null;
  from_display_name: string | null;
  status: CampaignStatus;
  recipient_selection: Record<string, unknown>;
  attachment_ids: string[];
  batch_size: number;
  send_interval_seconds: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_recipients: number;
  test_sent_to: string | null;
  test_sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailThreadRow {
  id: string;
  contact_id: string | null;
  contact_email: string;
  subject_normalized: string;
  campaign_id: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  is_unread: boolean;
  status: "open" | "archived";
  created_at: string;
  updated_at: string;
}

export type RecipientStatus =
  | "pending"
  | "queued"
  | "sending"
  | "sent"
  | "failed"
  | "skipped"
  | "suppressed"
  | "replied"
  | "unsubscribed";

export interface EmailCampaignRecipientRow {
  id: string;
  campaign_id: string;
  contact_id: string;
  email_snapshot: string;
  name_snapshot: string | null;
  status: RecipientStatus;
  locked_at: string | null;
  locked_by: string | null;
  attempt_count: number;
  last_error: string | null;
  queued_at: string | null;
  sent_at: string | null;
  hostinger_message_id: string | null;
  hostinger_uid: number | null;
  thread_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailMessageRow {
  id: string;
  thread_id: string;
  direction: "inbound" | "outbound";
  folder: string | null;
  hostinger_uid: number | null;
  message_id: string | null;
  in_reply_to: string | null;
  from_email: string;
  from_name: string | null;
  to_emails: string[];
  cc_emails: string[];
  bcc_emails: string[];
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  has_attachments: boolean;
  attachment_meta: Array<{ id: string; filename: string | null; contentType: string; sizeBytes: number }>;
  campaign_recipient_id: string | null;
  is_read: boolean;
  is_draft: boolean;
  message_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailWebhookEventRow {
  id: string;
  received_at: string;
  mailbox_resource_id: string | null;
  event_type: string;
  dedup_key: string | null;
  raw_body: string;
  parsed_body: unknown;
  headers: Record<string, string>;
  processing_status: "received" | "processing" | "processed" | "failed" | "ignored";
  resolved_message_id: string | null;
  error: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SuppressionReason = "unsubscribed" | "bounced_hard" | "bounced_soft" | "complaint" | "manual" | "invalid";

export interface EmailSuppressionRow {
  id: string;
  email_normalized: string;
  original_email: string;
  reason: SuppressionReason;
  source: string | null;
  campaign_recipient_id: string | null;
  notes: string | null;
  is_active: boolean;
  created_by: string | null;
  restored_at: string | null;
  restored_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailSettingRow {
  key: string;
  value: unknown;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type ActivityActorType = "user" | "system" | "webhook" | "cron";

export interface EmailActivityLogRow {
  id: string;
  actor_type: ActivityActorType;
  actor_id: string | null;
  actor_label: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}
