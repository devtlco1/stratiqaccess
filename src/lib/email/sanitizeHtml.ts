import sanitizeHtml from "sanitize-html";

// Two sanitization profiles, both allowlist-based (sanitize-html strips
// anything not explicitly permitted, including <script>, on* handlers, and
// javascript: URLs by default):
//
// - sanitizeComposedHtml: for template/campaign/reply bodies an admin writes
//   and we send out. Slightly more permissive (tables, inline styles —
//   common in outreach emails) but still no scripts/iframes/forms.
// - sanitizeReceivedHtml: for inbound mail rendered inside our own inbox UI.
//   Stricter — received HTML is untrusted third-party content, so images
//   are still allowed (attachments/inline images are common) but anything
//   that could act on our own admin session (forms, scripts, embeds) is
//   stripped, and every link is forced to open safely in a new tab.

const SHARED_ALLOWED_TAGS = [
  "p", "br", "hr", "div", "span",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "small", "sub", "sup", "blockquote", "pre", "code",
  "ul", "ol", "li",
  "a", "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
];

const SHARED_ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "width", "height", "title"],
  "*": ["style", "class"],
};

const SHARED_ALLOWED_STYLES: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": {
    color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/, /^[a-zA-Z]+$/],
    "background-color": [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/, /^[a-zA-Z]+$/],
    "font-size": [/^\d+(px|pt|em|%)$/],
    "font-weight": [/^(normal|bold|\d+)$/],
    "text-align": [/^(left|right|center|justify)$/],
    padding: [/^[\d.]+(px|em|%)?(\s[\d.]+(px|em|%)?){0,3}$/],
    margin: [/^[\d.]+(px|em|%)?(\s[\d.]+(px|em|%)?){0,3}$/],
  },
};

function forceSafeLinks(): sanitizeHtml.Transformer {
  return sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" });
}

export function sanitizeComposedHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: SHARED_ALLOWED_TAGS,
    allowedAttributes: SHARED_ALLOWED_ATTRIBUTES,
    allowedStyles: SHARED_ALLOWED_STYLES,
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: { a: forceSafeLinks() },
  });
}

export function sanitizeReceivedHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: SHARED_ALLOWED_TAGS,
    allowedAttributes: SHARED_ALLOWED_ATTRIBUTES,
    allowedStyles: SHARED_ALLOWED_STYLES,
    allowedSchemes: ["http", "https", "mailto"],
    // Received mail can carry data: URIs for inline images (cid references
    // are resolved to attachment URLs before this runs) — still block
    // anything else with a disallowed scheme.
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: { a: forceSafeLinks() },
    disallowedTagsMode: "discard",
  });
}

export function stripHtmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
