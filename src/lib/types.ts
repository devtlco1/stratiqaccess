export type Highlight = { title: string; description: string };

export type ServiceRow = {
  id: string;
  slug: string;
  icon: string;
  title: string;
  description: string;
  image_url: string | null;
  body: string[];
  highlights: Highlight[];
  sort_order: number;
  title_ar: string | null;
  description_ar: string | null;
  body_ar: string[];
  highlights_ar: Highlight[];
};

export type SectorRow = {
  id: string;
  slug: string;
  icon: string;
  title: string;
  description: string;
  image_url: string | null;
  body: string[];
  highlights: Highlight[];
  sort_order: number;
  title_ar: string | null;
  description_ar: string | null;
  body_ar: string[];
  highlights_ar: Highlight[];
};

export type CaseStudyRow = {
  id: string;
  slug: string;
  title: string;
  sector: string;
  summary: string;
  image_url: string | null;
  body: string[];
  sort_order: number;
  title_ar: string | null;
  sector_ar: string | null;
  summary_ar: string | null;
  body_ar: string[];
};

export type InsightRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  published_date: string;
  image_url: string | null;
  body: string[];
  sort_order: number;
  title_ar: string | null;
  excerpt_ar: string | null;
  body_ar: string[];
};

export type MessageRow = {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  company_name: string;
  country: string;
  phone: string | null;
  email: string;
  message: string;
  rfp_file_url: string | null;
  is_read: boolean;
  created_at: string;
};

export type ClientRow = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  industry: string | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type CustomerStatus = "New" | "Contacted" | "Qualified" | "In Progress" | "Won" | "Lost";

export type CustomerRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: CustomerStatus;
  notes: string | null;
  source_message_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteImageRow = {
  key: string;
  label: string;
  image_url: string | null;
};

export type SiteSettingsRow = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  email: string;
  location: string;
};
