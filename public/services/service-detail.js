const revealItems = document.querySelectorAll("[data-reveal]");
const galleryTrack = document.querySelector("[data-gallery-track]");
const heroMedia = document.querySelector("[data-hero-media]");
const collectionShowcase = document.querySelector("[data-service-collection]");
const serviceFeatureSections = document.querySelectorAll("[data-service-feature-options]");
const serviceFaqSections = document.querySelectorAll("[data-service-faq]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const desktopHover = window.matchMedia("(hover: hover) and (min-width: 900px)").matches;
const serviceFallbackImage = {
  "Kitchen Set": "../../assets/images/hero-kitchen-living.webp",
  "Lemari Custom": "../../assets/images/custom-wardrobe.webp",
  "Kamar Interior": "../../assets/images/bedroom-interior.webp",
  "Kamar Anak": "../../assets/images/kids-bedroom.webp",
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function setupFaqItem(item) {
  if (!item || item.dataset.faqReady === "true") return;
  const trigger = item.querySelector("[data-faq-trigger]");
  const panel = item.querySelector("[data-faq-panel]");
  if (!trigger || !panel) return;

  trigger.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
    panel.setAttribute("aria-hidden", String(!isOpen));
  });
  item.dataset.faqReady = "true";
}

document.querySelectorAll("[data-faq-item]").forEach(setupFaqItem);

if (galleryTrack) {
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let dragged = false;

  galleryTrack.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    isDragging = true;
    dragged = false;
    startX = event.clientX;
    startScrollLeft = galleryTrack.scrollLeft;
    galleryTrack.classList.add("is-dragging");
    galleryTrack.setPointerCapture(event.pointerId);
  });

  galleryTrack.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const delta = event.clientX - startX;

    if (Math.abs(delta) > 6) {
      dragged = true;
    }

    galleryTrack.scrollLeft = startScrollLeft - delta;
  });

  function endGalleryDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    galleryTrack.classList.remove("is-dragging");

    if (galleryTrack.hasPointerCapture(event.pointerId)) {
      galleryTrack.releasePointerCapture(event.pointerId);
    }
  }

  galleryTrack.addEventListener("pointerup", endGalleryDrag);
  galleryTrack.addEventListener("pointercancel", endGalleryDrag);
  galleryTrack.addEventListener(
    "click",
    (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    },
    true
  );
}

if (heroMedia && !reduceMotion && desktopHover) {
  heroMedia.addEventListener("mousemove", (event) => {
    const image = heroMedia.querySelector("img");
    if (!image) return;

    const rect = heroMedia.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    image.style.transform = `scale(1.02) translate(${(x * 12).toFixed(2)}px, ${(y * 10).toFixed(2)}px)`;
  });

  heroMedia.addEventListener("mouseleave", () => {
    const image = heroMedia.querySelector("img");
    if (image) {
      image.style.transform = "";
    }
  });
}

function isSupabaseConfigured(config) {
  return Boolean(
    config?.restUrl &&
      config?.anonKey &&
      !config.anonKey.includes("PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE")
  );
}

function normalizeStyleKey(value) {
  return String(value || "Modern").trim() || "Modern";
}

function groupByStyle(items) {
  return items.reduce((groups, item) => {
    const key = normalizeStyleKey(item.style_type);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
    return groups;
  }, new Map());
}

function createCollectionTab(label, isActive) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.collectionStyle = label;
  button.className = isActive ? "is-active" : "";
  button.setAttribute("aria-pressed", String(isActive));
  return button;
}

function createCollectionCard(item, serviceCategory) {
  const article = document.createElement("article");
  article.className = "collection-showcase-card is-visible";
  article.dataset.reveal = "";

  const figure = document.createElement("figure");
  const image = document.createElement("img");
  image.decoding = "async";
  image.loading = "lazy";
  image.src = item.image_url || serviceFallbackImage[serviceCategory] || serviceFallbackImage["Kitchen Set"];
  image.alt = item.image_alt || `${item.title} ${serviceCategory} by Kediamanku`;
  figure.append(image);

  const title = document.createElement("h3");
  title.textContent = item.title || "Custom Interior Detail";

  const description = document.createElement("p");
  description.textContent = item.description || "Refined custom detail designed around daily living.";

  article.append(figure, title, description);
  return article;
}

function createServiceFeatureCard(item, serviceCategory, index) {
  const article = document.createElement("article");
  article.className = "option-card is-visible";
  article.dataset.reveal = "";

  const image = document.createElement("img");
  image.decoding = "async";
  image.loading = "lazy";
  image.src = item.image_url || serviceFallbackImage[serviceCategory] || serviceFallbackImage["Kitchen Set"];
  image.alt = item.image_alt || `${item.title} ${serviceCategory} feature by Kediamanku`;
  article.append(image);

  const content = document.createElement("div");
  content.className = "option-content";

  const top = document.createElement("div");
  top.className = "option-top";

  const number = document.createElement("span");
  number.textContent = `${String(index + 1).padStart(2, "0")}.`;

  const eyebrow = document.createElement("span");
  eyebrow.textContent = item.eyebrow || item.feature_label || serviceCategory;
  top.append(number, eyebrow);

  const text = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = item.title || "Custom Feature";
  const description = document.createElement("p");
  description.textContent = item.description || "Refined detail designed around daily living.";
  text.append(title, description);

  content.append(top, text);
  article.append(content);
  return article;
}

async function loadServiceFeatureOptions() {
  if (!serviceFeatureSections.length) return;
  const config = window.KEDIAMANKU_SUPABASE || {};
  if (!isSupabaseConfigured(config)) return;

  await Promise.all([...serviceFeatureSections].map(async (section) => {
    const serviceCategory = section.dataset.serviceCategory;
    const grid = section.querySelector("[data-service-feature-grid]") || section.querySelector(".option-grid");
    if (!serviceCategory || !grid) return;

    const params = new URLSearchParams({
      select: "id,service_category,eyebrow,feature_label,title,description,image_url,image_alt,sort_order,created_at",
      service_category: `eq.${serviceCategory}`,
      is_published: "eq.true",
      order: "sort_order.asc,created_at.asc",
    });

    try {
      const response = await fetch(`${config.restUrl}/service_feature_options?${params}`, {
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
        },
      });
      if (!response.ok) throw new Error("Cannot load service feature options.");
      const items = await response.json();
      if (!Array.isArray(items) || !items.length) return;
      grid.replaceChildren(...items.map((item, index) => createServiceFeatureCard(item, serviceCategory, index)));
    } catch (error) {
      console.warn(error);
    }
  }));
}

function createServiceFaqItem(item, index) {
  const article = document.createElement("article");
  article.className = `faq-item is-visible${index === 0 ? " is-open" : ""}`;
  article.dataset.faqItem = "";
  article.dataset.reveal = "";

  const button = document.createElement("button");
  button.className = "faq-trigger";
  button.type = "button";
  button.dataset.faqTrigger = "";
  button.setAttribute("aria-expanded", String(index === 0));
  button.append(document.createTextNode(item.question || "Service question"));

  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "+";
  button.append(icon);

  const panel = document.createElement("div");
  panel.className = "faq-panel";
  panel.dataset.faqPanel = "";
  if (index !== 0) panel.setAttribute("aria-hidden", "true");

  const inner = document.createElement("div");
  const answer = document.createElement("p");
  answer.textContent = item.answer || "Our team will guide the right detail for your space.";
  inner.append(answer);
  panel.append(inner);

  article.append(button, panel);
  setupFaqItem(article);
  return article;
}

async function loadServiceFaqs() {
  if (!serviceFaqSections.length) return;
  const config = window.KEDIAMANKU_SUPABASE || {};
  if (!isSupabaseConfigured(config)) return;

  await Promise.all([...serviceFaqSections].map(async (section) => {
    const serviceCategory = section.dataset.serviceCategory;
    const list = section.querySelector("[data-service-faq-list]") || section.querySelector(".faq-list");
    if (!serviceCategory || !list) return;

    const params = new URLSearchParams({
      select: "id,service_category,question,answer,sort_order,created_at",
      service_category: `eq.${serviceCategory}`,
      is_published: "eq.true",
      order: "sort_order.asc,created_at.asc",
    });

    try {
      const response = await fetch(`${config.restUrl}/service_faq_items?${params}`, {
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
        },
      });
      if (!response.ok) throw new Error("Cannot load service FAQ items.");
      const items = await response.json();
      if (!Array.isArray(items) || !items.length) return;
      list.replaceChildren(...items.map(createServiceFaqItem));
    } catch (error) {
      console.warn(error);
    }
  }));
}

function renderCollectionItems(groups, activeStyle, serviceCategory) {
  const grid = collectionShowcase?.querySelector("[data-collection-grid]");
  const tabs = collectionShowcase?.querySelector("[data-collection-tabs]");
  if (!grid || !tabs) return;

  const items = groups.get(activeStyle) || [];
  grid.classList.add("is-switching");
  window.setTimeout(() => {
    grid.replaceChildren(...items.map((item) => createCollectionCard(item, serviceCategory)));
    tabs.querySelectorAll("[data-collection-style]").forEach((tab) => {
      const isActive = tab.dataset.collectionStyle === activeStyle;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });
    grid.classList.remove("is-switching");
  }, reduceMotion ? 0 : 160);
}

function setupCollectionTabs(groups, serviceCategory) {
  const tabs = collectionShowcase?.querySelector("[data-collection-tabs]");
  const grid = collectionShowcase?.querySelector("[data-collection-grid]");
  if (!tabs || !grid || !groups.size) return;

  const styles = [...groups.keys()];
  const activeStyle = styles[0];
  tabs.replaceChildren(...styles.map((style, index) => createCollectionTab(style, index === 0)));
  tabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-collection-style]");
    if (!tab || tab.classList.contains("is-active")) return;
    renderCollectionItems(groups, tab.dataset.collectionStyle, serviceCategory);
  });
  renderCollectionItems(groups, activeStyle, serviceCategory);
}

async function loadServiceCollection() {
  if (!collectionShowcase) return;
  const config = window.KEDIAMANKU_SUPABASE || {};
  if (!isSupabaseConfigured(config)) return;

  const serviceCategory = collectionShowcase.dataset.serviceCategory;
  if (!serviceCategory) return;

  const params = new URLSearchParams({
    select: "id,service_category,style_type,title,description,image_url,image_alt,sort_order,created_at",
    service_category: `eq.${serviceCategory}`,
    is_published: "eq.true",
    order: "style_type.asc,sort_order.asc,created_at.asc",
  });

  try {
    const response = await fetch(`${config.restUrl}/service_collection_items?${params}`, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
      },
    });
    if (!response.ok) throw new Error("Cannot load service collection items.");
    const items = await response.json();
    if (!Array.isArray(items) || !items.length) return;
    setupCollectionTabs(groupByStyle(items), serviceCategory);
  } catch (error) {
    console.warn(error);
  }
}

loadServiceFeatureOptions();
loadServiceFaqs();
loadServiceCollection();
