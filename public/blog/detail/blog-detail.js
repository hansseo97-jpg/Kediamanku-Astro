const supabaseConfig = window.KEDIAMANKU_SUPABASE || {};

const page = document.querySelector("[data-blog-page]");
const breadcrumbTitle = document.querySelector("[data-breadcrumb-title]");
const categoryElement = document.querySelector("[data-category]");
const titleElement = document.querySelector("[data-title]");
const authorAvatar = document.querySelector("[data-author-avatar]");
const authorName = document.querySelector("[data-author-name]");
const authorRole = document.querySelector("[data-author-role]");
const publishedDate = document.querySelector("[data-published-date]");
const readTime = document.querySelector("[data-read-time]");
const featuredImage = document.querySelector("[data-featured-image]");
const contentRoot = document.querySelector("[data-content]");
const tocRoot = document.querySelector("[data-toc]");
const popularRoot = document.querySelector("[data-popular-articles]");
const relatedRoot = document.querySelector("[data-related-articles]");
const tocCard = document.querySelector(".toc-card");
const tocToggle = document.querySelector("[data-toc-toggle]");

const fallbackImage = "../../assets/images/hero-kitchen-living.webp";

function hasSupabaseConfig() {
  return Boolean(
    supabaseConfig.restUrl &&
      supabaseConfig.anonKey &&
      !supabaseConfig.anonKey.includes("PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE")
  );
}

function siteOrigin() {
  if (/^https?:\/\//i.test(window.location.origin)) return window.location.origin;
  return "https://kediamanku.id";
}

function getSlug() {
  const querySlug = new URLSearchParams(window.location.search).get("slug");
  if (querySlug) return querySlug;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const blogIndex = parts.lastIndexOf("blog");
  if (blogIndex === -1) return "";

  const next = parts[blogIndex + 1];
  const afterDetail = parts[blogIndex + 2];
  if (next === "detail" && afterDetail && afterDetail !== "index.html") return afterDetail;
  if (next && next !== "index.html" && next !== "detail") return next;
  return "";
}

function compactText(value, fallback = "") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function resolveImagePath(path) {
  const value = String(path || "").trim();
  if (!value || /^(javascript|data|vbscript):/i.test(value)) return fallbackImage;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("../../") || value.startsWith("./")) return value;
  if (value.startsWith("../assets/")) return `../../${value.slice(3)}`;
  if (value.startsWith("/")) return `../..${value}`;
  return `../../${value.replace(/^\/+/, "")}`;
}

function absoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, `${siteOrigin()}/blog/detail/`).href;
}

function postUrl(slug) {
  return `${siteOrigin()}/blog/${encodeURIComponent(slug)}/`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function setMeta(selector, attribute, value) {
  if (!value) return;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    const nameMatch = selector.match(/\[name="([^"]+)"\]/);
    const propertyMatch = selector.match(/\[property="([^"]+)"\]/);
    if (nameMatch) element.setAttribute("name", nameMatch[1]);
    if (propertyMatch) element.setAttribute("property", propertyMatch[1]);
    document.head.append(element);
  }
  element.setAttribute(attribute, value);
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.append(link);
  }
  link.href = url;
}

function setJsonLd(data) {
  let script = document.head.querySelector('script[type="application/ld+json"][data-blog-schema]');
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.blogSchema = "";
    document.head.append(script);
  }
  script.textContent = JSON.stringify(data);
}

function updateSeo(post, image) {
  const title = post.seo_title || `${post.title} | Kediamanku Blog`;
  const description = compactText(post.seo_description || post.excerpt, "Kediamanku interior design and build article.").slice(0, 160);
  const url = postUrl(post.slug);
  document.title = title;
  setMeta('meta[name="description"]', "content", description);
  setMeta('meta[name="keywords"]', "content", [...(post.seo_keywords || []), ...(post.tags || [])].join(", "));
  setCanonical(url);
  setMeta('meta[property="og:type"]', "content", "article");
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  setMeta('meta[property="og:url"]', "content", url);
  setMeta('meta[property="og:image"]', "content", absoluteUrl(image));
  setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
  setMeta('meta[name="twitter:title"]', "content", title);
  setMeta('meta[name="twitter:description"]', "content", description);
  setMeta('meta[name="twitter:image"]', "content", absoluteUrl(image));

  setJsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: absoluteUrl(image),
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      "@type": "Organization",
      name: post.author_name || "Kediamanku Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Kediamanku",
      logo: {
        "@type": "ImageObject",
        url: `${siteOrigin()}/assets/images/logo-kediamanku-transparent.png`,
      },
    },
    mainEntityOfPage: url,
  });
}

function contentBlocks(post) {
  if (Array.isArray(post.content)) return post.content;
  if (post.content?.blocks && Array.isArray(post.content.blocks)) return post.content.blocks;
  return [
    { type: "paragraph", text: post.excerpt || "Article content will appear here after it is added from the admin blog editor." },
  ];
}

function renderTextBlock(block) {
  const type = block.type || "paragraph";
  const text = compactText(block.text);
  if (!text) return null;

  if (type === "h2" || type === "h3") {
    const heading = createElement(type, "", text);
    heading.id = block.id || slugify(text);
    heading.dataset.tocHeading = "";
    return heading;
  }

  if (type === "quote") {
    return createElement("blockquote", "", text);
  }

  const paragraph = createElement("p", "", text);
  return paragraph;
}

function renderListBlock(block) {
  const items = Array.isArray(block.items) ? block.items.map((item) => compactText(item)).filter(Boolean) : [];
  if (!items.length) return null;
  const list = document.createElement(block.type === "ordered-list" ? "ol" : "ul");
  items.forEach((item) => list.append(createElement("li", "", item)));
  return list;
}

function renderImageBlock(block) {
  const image = document.createElement("img");
  image.src = resolveImagePath(block.url || block.src);
  image.alt = block.alt || "Kediamanku interior design article image";
  image.loading = "lazy";
  return image;
}

function renderContent(post) {
  contentRoot.replaceChildren();
  contentBlocks(post).forEach((block) => {
    let element = null;
    if (block.type === "list" || block.type === "ordered-list") element = renderListBlock(block);
    else if (block.type === "image") element = renderImageBlock(block);
    else element = renderTextBlock(block);

    if (element) {
      element.dataset.reveal = "";
      contentRoot.append(element);
    }
  });
}

function buildToc() {
  const headings = [...contentRoot.querySelectorAll("[data-toc-heading]")];
  tocRoot.replaceChildren();

  if (!headings.length) {
    tocRoot.append(createElement("span", "", "Contents will appear after headings are added."));
    return;
  }

  headings.forEach((heading) => {
    const link = createElement("a", "", heading.textContent);
    link.href = `#${heading.id}`;
    link.dataset.level = heading.tagName === "H3" ? "3" : "2";
    tocRoot.append(link);
  });

  if (!("IntersectionObserver" in window)) return;

  const links = [...tocRoot.querySelectorAll("a")];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
        }
      });
    },
    { rootMargin: "-15% 0px -72% 0px", threshold: 0 }
  );
  headings.forEach((heading) => observer.observe(heading));
}

function getAnchorOffset() {
  const nav = document.querySelector(".projects-nav");
  const navHeight = nav ? nav.getBoundingClientRect().height : 0;
  return Math.max(104, Math.ceil(navHeight + 28));
}

function scrollToHeading(id) {
  const target = document.getElementById(id);
  if (!target) return;

  const y = target.getBoundingClientRect().top + window.scrollY - getAnchorOffset();
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  if (window.history?.pushState) {
    window.history.pushState(null, "", `#${encodeURIComponent(id)}`);
  }
}

function formatDate(value) {
  if (!value) return "Draft";
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

function renderPost(post) {
  const image = resolveImagePath(post.featured_image);
  breadcrumbTitle.textContent = post.title;
  categoryElement.textContent = post.category;
  titleElement.textContent = post.title;
  authorAvatar.src = resolveImagePath(post.author_avatar || "../../kediamanku-monogram.svg");
  authorAvatar.alt = `${post.author_name || "Kediamanku Editorial Team"} avatar`;
  authorName.textContent = post.author_name || "Kediamanku Editorial Team";
  authorRole.textContent = post.author_role || "Interior Design & Build";
  publishedDate.textContent = formatDate(post.published_at);
  readTime.textContent = `${post.read_time_minutes || 4} Min Read`;
  featuredImage.src = image;
  featuredImage.alt = post.featured_image_alt || `${post.title} by Kediamanku`;
  renderContent(post);
  buildToc();
  updateSeo(post, image);
  setupReveal();
}

function articleLink(post, compact = false) {
  const link = document.createElement("a");
  link.href = window.location.protocol === "file:"
    ? `../detail/index.html?slug=${encodeURIComponent(post.slug)}`
    : `../${encodeURIComponent(post.slug)}/`;
  if (compact) {
    link.textContent = post.title;
    return link;
  }

  link.className = "related-card";
  const image = document.createElement("img");
  image.src = resolveImagePath(post.featured_image);
  image.alt = `${post.title} article by Kediamanku`;
  image.loading = "lazy";
  const copy = document.createElement("div");
  copy.append(createElement("span", "", post.category));
  copy.append(createElement("h3", "", post.title));
  link.append(image, copy);
  return link;
}

async function fetchPost(slug) {
  const query = new URLSearchParams({
    select: "*",
    slug: `eq.${slug}`,
    status: "eq.published",
    limit: "1",
  });

  const response = await fetch(`${supabaseConfig.restUrl}/blog_posts?${query}`, {
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
    },
  });

  if (!response.ok) throw new Error("Blog article could not be loaded.");
  const rows = await response.json();
  return rows[0] || null;
}

async function fetchArticleList({ category, excludeSlug, limit = 4 } = {}) {
  const query = new URLSearchParams({
    select: "id,slug,title,category,excerpt,featured_image,published_at",
    status: "eq.published",
    order: "published_at.desc",
    limit: String(limit + 1),
  });
  if (category) query.set("category", `eq.${category}`);

  const response = await fetch(`${supabaseConfig.restUrl}/blog_posts?${query}`, {
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
    },
  });

  if (!response.ok) return [];
  const rows = await response.json();
  return rows.filter((post) => post.slug !== excludeSlug).slice(0, limit);
}

async function renderSidebarLists(post) {
  const [popular, related] = await Promise.all([
    fetchArticleList({ excludeSlug: post.slug, limit: 5 }),
    fetchArticleList({ category: post.category, excludeSlug: post.slug, limit: 4 }),
  ]);

  popularRoot.replaceChildren();
  relatedRoot.replaceChildren();

  if (!popular.length) popularRoot.append(createElement("span", "", "Popular articles will appear after more posts are published."));
  popular.forEach((item) => popularRoot.append(articleLink(item, true)));

  if (!related.length) relatedRoot.append(createElement("p", "blog-error", "Related articles will appear after more posts are published."));
  related.forEach((item) => relatedRoot.append(articleLink(item)));
}

function renderError(message) {
  page.replaceChildren();
  page.append(createElement("p", "blog-error", message));
}

function setupReveal() {
  const items = [
    document.querySelector(".article-hero"),
    document.querySelector(".featured-image"),
    ...document.querySelectorAll("[data-reveal], .sidebar-card, .cta-card, .related-card"),
  ].filter(Boolean);

  items.forEach((item) => item.dataset.reveal = "");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

tocToggle?.addEventListener("click", () => {
  tocCard.classList.toggle("is-open");
  tocToggle.textContent = tocCard.classList.contains("is-open") ? "Close contents" : "Open contents";
});

tocRoot?.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;

  const id = decodeURIComponent(link.getAttribute("href").slice(1));
  if (!id) return;

  event.preventDefault();
  scrollToHeading(id);
});

async function initBlogDetail() {
  const slug = getSlug();
  if (!slug) {
    renderError("Blog slug is missing. Open this page from a published article URL.");
    return;
  }
  if (!hasSupabaseConfig()) {
    renderError("Supabase configuration is not active yet.");
    return;
  }

  try {
    const post = await fetchPost(slug);
    if (!post) {
      renderError("Article not found or not published.");
      return;
    }
    renderPost(post);
    renderSidebarLists(post);
  } catch (error) {
    renderError(error.message);
  }
}

initBlogDetail();
