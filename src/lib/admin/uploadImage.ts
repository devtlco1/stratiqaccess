import type { SupabaseClient } from "@supabase/supabase-js";

// Uploads a File to the public "media" bucket under the given folder and
// returns its public URL. Returns null if no file was provided (i.e. the
// admin left the field empty, keeping whatever image URL already existed).
export async function uploadImage(
  supabase: SupabaseClient,
  file: File | null,
  folder: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

// "One paragraph per blank-line-separated block" -> string[]
export function parseBody(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// "Title | Description" per line -> {title, description}[]
export function parseHighlights(raw: string): { title: string; description: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: title.trim(), description: rest.join("|").trim() };
    });
}

export function bodyToText(body: string[]): string {
  return body.join("\n\n");
}

export function highlightsToText(highlights: { title: string; description: string }[]): string {
  return highlights.map((h) => `${h.title} | ${h.description}`).join("\n");
}

// "Question | Answer" per line -> {question, answer}[]
export function parseFaq(raw: string): { question: string; answer: string }[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, ...rest] = line.split("|");
      return { question: question.trim(), answer: rest.join("|").trim() };
    });
}

export function faqToText(faq: { question: string; answer: string }[]): string {
  return faq.map((f) => `${f.question} | ${f.answer}`).join("\n");
}
