// Hand-authored to mirror supabase/schema.sql. If the schema changes,
// prefer regenerating with `supabase gen types typescript` once a live
// project is linked, then re-apply any manual adjustments below.

export type UserRole = "admin" | "editor" | "client" | "visitor";
export type ContentStatus = "draft" | "published";
export type OpportunityKind = "tender" | "investment";
export type OpportunityStatus = "open" | "closed" | "under_review" | "awarded";
export type PurchaseStatus = "pending" | "approved" | "rejected";
export type PaymentMethod = "stripe" | "bank_transfer" | "fastpay" | "zaincash" | "manual";
export type LeadStatus = "new" | "reviewed" | "archived";
export type NdaStatus = "pending" | "approved" | "rejected";
export type LeadFormType =
  | "general"
  | "market_entry"
  | "representation"
  | "partnership"
  | "tender_intelligence";

interface Table<Row, Insert, Update = Partial<Insert>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        { id: string; email: string; full_name: string | null; role: UserRole; created_at: string },
        { id: string; email: string; full_name?: string | null; role?: UserRole }
      >;
      site_settings: Table<
        {
          id: number;
          site_name: string;
          tagline: string;
          legal_footer: string;
          legal_footer_extended: string | null;
          disclosure_notice: string;
          contact_email: string;
          social_links: Record<string, string>;
          updated_at: string;
        },
        Partial<{
          site_name: string;
          tagline: string;
          legal_footer: string;
          legal_footer_extended: string | null;
          disclosure_notice: string;
          contact_email: string;
          social_links: Record<string, string>;
        }>
      >;
      languages: Table<
        { code: string; name: string; is_rtl: boolean; is_active: boolean; sort_order: number },
        { code: string; name: string; is_rtl?: boolean; is_active?: boolean; sort_order?: number }
      >;
      translations: Table<
        { id: string; namespace: string; key: string; locale: string; value: string; updated_at: string },
        { namespace: string; key: string; locale: string; value: string }
      >;
      pages: Table<
        {
          id: string;
          slug: string;
          title: string;
          seo_title: string | null;
          seo_description: string | null;
          status: ContentStatus;
          updated_at: string;
        },
        {
          slug: string;
          title: string;
          seo_title?: string | null;
          seo_description?: string | null;
          status?: ContentStatus;
        }
      >;
      page_sections: Table<
        {
          id: string;
          page_id: string;
          key: string;
          heading: string | null;
          body: string | null;
          sort_order: number;
          is_hidden: boolean;
        },
        {
          page_id: string;
          key: string;
          heading?: string | null;
          body?: string | null;
          sort_order?: number;
          is_hidden?: boolean;
        }
      >;
      services: Table<
        {
          id: string;
          slug: string;
          title: string;
          summary: string;
          body: string | null;
          icon: string | null;
          sort_order: number;
          featured: boolean;
          status: ContentStatus;
          updated_at: string;
        },
        {
          slug: string;
          title: string;
          summary: string;
          body?: string | null;
          icon?: string | null;
          sort_order?: number;
          featured?: boolean;
          status?: ContentStatus;
        }
      >;
      sectors: Table<
        {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          icon: string | null;
          sort_order: number;
          featured: boolean;
          status: ContentStatus;
          updated_at: string;
        },
        {
          slug: string;
          title: string;
          description?: string | null;
          icon?: string | null;
          sort_order?: number;
          featured?: boolean;
          status?: ContentStatus;
        }
      >;
      opportunities: Table<
        {
          id: string;
          kind: OpportunityKind;
          title: string;
          sector_id: string | null;
          buyer: string | null;
          location: string | null;
          country: string | null;
          deadline: string | null;
          status: OpportunityStatus;
          tender_type: string | null;
          summary: string;
          confidential_details: string | null;
          tags: string[];
          price: number | null;
          is_free_preview: boolean;
          requires_nda: boolean;
          featured: boolean;
          content_status: ContentStatus;
          created_at: string;
          updated_at: string;
        },
        {
          kind?: OpportunityKind;
          title: string;
          sector_id?: string | null;
          buyer?: string | null;
          location?: string | null;
          country?: string | null;
          deadline?: string | null;
          status?: OpportunityStatus;
          tender_type?: string | null;
          summary: string;
          confidential_details?: string | null;
          tags?: string[];
          price?: number | null;
          is_free_preview?: boolean;
          requires_nda?: boolean;
          featured?: boolean;
          content_status?: ContentStatus;
        }
      >;
      opportunity_attachments: Table<
        {
          id: string;
          opportunity_id: string;
          file_path: string;
          file_name: string;
          is_public: boolean;
          created_at: string;
        },
        { opportunity_id: string; file_path: string; file_name: string; is_public?: boolean }
      >;
      saved_opportunities: Table<
        { id: string; user_id: string; opportunity_id: string; created_at: string },
        { user_id: string; opportunity_id: string }
      >;
      nda_requests: Table<
        {
          id: string;
          user_id: string | null;
          opportunity_id: string;
          company_name: string;
          email: string;
          message: string | null;
          status: NdaStatus;
          created_at: string;
        },
        {
          user_id?: string | null;
          opportunity_id: string;
          company_name: string;
          email: string;
          message?: string | null;
          status?: NdaStatus;
        }
      >;
      reports: Table<
        {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          price: number;
          currency: string;
          file_path: string | null;
          cover_image_path: string | null;
          featured: boolean;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        },
        {
          slug: string;
          title: string;
          description?: string | null;
          price?: number;
          currency?: string;
          file_path?: string | null;
          cover_image_path?: string | null;
          featured?: boolean;
          status?: ContentStatus;
        }
      >;
      purchases: Table<
        {
          id: string;
          user_id: string;
          item_type: "report" | "opportunity";
          item_id: string;
          amount: number;
          currency: string;
          payment_method: PaymentMethod;
          status: PurchaseStatus;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
        },
        {
          user_id: string;
          item_type: "report" | "opportunity";
          item_id: string;
          amount: number;
          currency?: string;
          payment_method?: PaymentMethod;
          status?: PurchaseStatus;
        },
        Partial<{
          status: PurchaseStatus;
          approved_by: string | null;
          approved_at: string | null;
        }>
      >;
      downloads: Table<
        {
          id: string;
          purchase_id: string;
          file_path: string;
          download_count: number;
          last_downloaded_at: string | null;
        },
        { purchase_id: string; file_path: string; download_count?: number }
      >;
      articles: Table<
        {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          body: string | null;
          cover_image_path: string | null;
          sector_id: string | null;
          featured: boolean;
          status: ContentStatus;
          published_at: string | null;
          created_at: string;
        },
        {
          slug: string;
          title: string;
          excerpt?: string | null;
          body?: string | null;
          cover_image_path?: string | null;
          sector_id?: string | null;
          featured?: boolean;
          status?: ContentStatus;
          published_at?: string | null;
        }
      >;
      leads: Table<
        {
          id: string;
          form_type: LeadFormType;
          company_name: string | null;
          contact_person: string | null;
          email: string;
          country: string | null;
          sector: string | null;
          service_interest: string | null;
          message: string | null;
          attachment_path: string | null;
          status: LeadStatus;
          created_at: string;
        },
        {
          form_type?: LeadFormType;
          company_name?: string | null;
          contact_person?: string | null;
          email: string;
          country?: string | null;
          sector?: string | null;
          service_interest?: string | null;
          message?: string | null;
          attachment_path?: string | null;
        },
        Partial<{ status: LeadStatus }>
      >;
      media: Table<
        {
          id: string;
          file_path: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          uploaded_by: string | null;
          created_at: string;
        },
        {
          file_path: string;
          file_name: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          uploaded_by?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
