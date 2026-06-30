const SITE_URL = (process.env.SITE_URL || "https://kediamanku.id").replace(/\/$/, "");
const REST_URL = (
  process.env.SUPABASE_REST_URL ||
  "https://qkpdjmvkirsrbjpgqebh.supabase.co/rest/v1"
).replace(/\/$/, "");
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcGRqbXZraXJzcmJqcGdxZWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODQyNTMsImV4cCI6MjA5NjU2MDI1M30.BRyqEwMiDs-ZH_qVBAH2LmlSlES0ghtM6qYDSumQnGA";

export { SITE_URL };

export function absoluteUrl(path = "/") {
  const value = String(path || "/").trim();
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

export function assetUrl(path, fallback = "/assets/images/hero-kitchen-living.webp") {
  const value = String(path || "").trim();
  if (!value || /^(javascript|data|vbscript):/i.test(value)) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return value;
  return `/${value.replace(/^(\.\.\/|\.\/)+/, "").replace(/^\/+/, "")}`;
}

export function compactText(value, fallback = "") {
  return String(value || "").replace(/\s+/g, " ").trim() || fallback;
}

export function excerpt(value, fallback = "", max = 160) {
  return compactText(value, fallback).slice(0, max);
}

export function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(value) {
  if (!value) return "Published soon";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Published soon";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export async function fetchSupabaseRows(table, params = {}) {
  if (!REST_URL || !ANON_KEY) return [];
  try {
    const url = new URL(`${REST_URL}/${table}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });
    if (!response.ok) {
      console.warn(`Supabase ${table} request failed: ${response.status}`);
      return [];
    }
    return response.json();
  } catch (error) {
    console.warn(`Supabase ${table} request failed`, error);
    return [];
  }
}

export async function fetchPublishedProjects() {
  return fetchSupabaseRows("projects", {
    select:
      "id,slug,title,category,location,project_year,area_scope,materials,image_url,image_alt,tags,testimonial_metric,testimonial_metric_label,testimonial_quote,testimonial_client_name,testimonial_client_role,testimonial_image_url,is_featured,sort_order,created_at,updated_at",
    is_published: "eq.true",
    order: "sort_order.asc,created_at.desc",
  });
}

export async function fetchPublishedPosts() {
  return fetchSupabaseRows("blog_posts", {
    select:
      "id,title,slug,excerpt,content,featured_image,author_name,author_role,author_avatar,category,tags,seo_title,seo_description,seo_keywords,read_time_minutes,published_at,created_at,updated_at",
    status: "eq.published",
    published_at: `lte.${new Date().toISOString()}`,
    order: "published_at.desc",
  });
}

export async function fetchPublishedProducts() {
  return fetchSupabaseRows("catalog_products", {
    select:
      "id,slug,name,product_code,category,description,material,size,finishing,production_time,packaging_installation,price_range,price_value,image_url,images,image_alt,featured,sort_order,created_at,updated_at",
    is_published: "eq.true",
    order: "sort_order.asc,created_at.desc",
  });
}

export function projectDefaults(category = "Kitchen Set") {
  const defaults = {
    "Kitchen Set": {
      image: "/assets/images/hero-kitchen-living.webp",
      description:
        "A refined kitchen set shaped around warm material tones, efficient storage, and clean cabinet composition.",
      scope: ["Design Direction", "Custom Furniture", "Production", "Installation"],
      materials: ["HPL", "Plywood", "Premium Hardware", "LED Lighting", "Soft-close System"],
    },
    "Lemari Custom": {
      image: "/assets/images/custom-wardrobe.webp",
      description:
        "A made-to-measure wardrobe system shaped around calm bedroom integration, storage rhythm, and display lighting.",
      scope: ["Storage Mapping", "Wardrobe System", "Drawer Planning", "Installation"],
      materials: ["Plywood", "HPL", "Smoked Glass", "Mirror", "Soft-close System"],
    },
    "Kamar Interior": {
      image: "/assets/images/bedroom-interior.webp",
      description:
        "A calm bedroom interior designed with warm proportions, soft lighting, integrated furniture, and refined daily comfort.",
      scope: ["Layout Direction", "Headboard Wall", "Lighting Plan", "Custom Furniture"],
      materials: ["Wall Panel", "HPL", "Fabric Texture", "Warm LED", "Premium Hardware"],
    },
    "Kamar Anak": {
      image: "/assets/images/kids-bedroom.webp",
      description:
        "A kids room designed to feel playful, safe, functional, and long-lasting through storage, study support, and child-friendly proportions.",
      scope: ["Room Zoning", "Study Desk", "Storage System", "Safe Furniture"],
      materials: ["Plywood", "HPL", "Rounded Detail", "Warm LED", "Soft-close System"],
    },
  };
  return defaults[category] || defaults["Kitchen Set"];
}

export function materialList(project) {
  const defaults = projectDefaults(project.category).materials;
  const raw = [project.materials, ...(Array.isArray(project.tags) ? project.tags : [])]
    .filter(Boolean)
    .join(",")
    .split(/[,;/|]/)
    .map((item) => compactText(item))
    .filter(Boolean);
  return [...new Set([...raw, ...defaults])].slice(0, 8);
}

export function titleLines(title) {
  const words = compactText(title, "Kediamanku Project").split(" ");
  if (words.length <= 2) return [words.join(" ")];
  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

export function contentBlocks(post) {
  if (Array.isArray(post.content)) return post.content;
  if (post.content?.blocks && Array.isArray(post.content.blocks)) return post.content.blocks;
  return [
    {
      type: "paragraph",
      text:
        post.excerpt ||
        "Article content will appear here after it is added from the admin blog editor.",
    },
  ];
}
