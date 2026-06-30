const SITE_URL = process.env.SITE_URL || "https://kediamanku.id";
const SUPABASE_REST_URL =
  process.env.SUPABASE_REST_URL || "https://qkpdjmvkirsrbjpgqebh.supabase.co/rest/v1";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcGRqbXZraXJzcmJqcGdxZWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODQyNTMsImV4cCI6MjA5NjU2MDI1M30.BRyqEwMiDs-ZH_qVBAH2LmlSlES0ghtM6qYDSumQnGA";

const staticPages = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/services/", priority: "0.9", changefreq: "monthly" },
  { loc: "/services/kitchen-set/", priority: "0.9", changefreq: "monthly" },
  { loc: "/services/lemari-custom/", priority: "0.9", changefreq: "monthly" },
  { loc: "/services/kamar-interior/", priority: "0.9", changefreq: "monthly" },
  { loc: "/services/kamar-anak/", priority: "0.9", changefreq: "monthly" },
  { loc: "/projects/", priority: "0.8", changefreq: "weekly" },
  { loc: "/testimonials/", priority: "0.7", changefreq: "monthly" },
  { loc: "/about/", priority: "0.7", changefreq: "monthly" },
  { loc: "/blog/", priority: "0.7", changefreq: "weekly" },
];

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absoluteUrl(path) {
  return `${SITE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function isoDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

async function fetchRows(path, params) {
  const url = new URL(`${SUPABASE_REST_URL.replace(/\/$/, "")}/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) return [];
  return response.json();
}

function urlNode({ loc, lastmod, changefreq = "monthly", priority = "0.7" }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(absoluteUrl(loc))}</loc>`,
    `    <lastmod>${escapeXml(isoDate(lastmod))}</lastmod>`,
    `    <changefreq>${escapeXml(changefreq)}</changefreq>`,
    `    <priority>${escapeXml(priority)}</priority>`,
    "  </url>",
  ].join("\n");
}

module.exports = async function sitemap(request, response) {
  const [projects, posts] = await Promise.all([
    fetchRows("projects", {
      select: "slug,updated_at,created_at",
      is_published: "eq.true",
      order: "updated_at.desc",
    }),
    fetchRows("blog_posts", {
      select: "slug,updated_at,published_at,created_at",
      status: "eq.published",
      order: "published_at.desc",
    }),
  ]);

  const dynamicPages = [
    ...projects
      .filter((item) => item.slug)
      .map((item) => ({
        loc: `/projects/${encodeURIComponent(item.slug)}/`,
        lastmod: item.updated_at || item.created_at,
        changefreq: "monthly",
        priority: "0.8",
      })),
    ...posts
      .filter((item) => item.slug)
      .map((item) => ({
        loc: `/blog/${encodeURIComponent(item.slug)}/`,
        lastmod: item.updated_at || item.published_at || item.created_at,
        changefreq: "monthly",
        priority: "0.6",
      })),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...staticPages, ...dynamicPages].map(urlNode),
    "</urlset>",
  ].join("\n");

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  response.status(200).send(xml);
};
