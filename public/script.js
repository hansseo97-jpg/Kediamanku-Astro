const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const servicesToggle = document.querySelector("[data-services-toggle]");
const servicesMenu = document.querySelector("[data-services-menu]");
const servicesShowcase = document.querySelector("[data-services-showcase]");
const servicePanels = document.querySelectorAll("[data-service-panel]");
const serviceImages = document.querySelectorAll("[data-service-image]");
const testimonialSection = document.querySelector("[data-testimonials]");
const testimonialFloatCards = document.querySelectorAll(".testimonial-float-card");
const benefitsSection = document.querySelector("[data-benefits]");
const benefitImages = document.querySelectorAll(".benefit-img");
const projectCarousel = document.querySelector("[data-project-carousel]");
const homeProjectGrid = document.querySelector("[data-home-project-grid]");
const homeProjectEmpty = document.querySelector("[data-home-project-empty]");
const homeServiceGrid = document.querySelector("[data-home-service-grid]");
const partnerTrack = document.querySelector("[data-partner-track]");
const workTrack = document.querySelector("[data-work-track]");
const workCards = [...document.querySelectorAll("[data-work-card]")];
const workDots = [...document.querySelectorAll("[data-work-dot]")];
const workProgressFill = document.querySelector("[data-work-progress-fill]");
const projectModal = document.querySelector("[data-project-modal]");
const projectTriggers = document.querySelectorAll("[data-project-trigger]");
const projectModalCloseButtons = document.querySelectorAll("[data-project-modal-close]");
const revealSections = document.querySelectorAll("main > section:not(.hero), .site-footer");

function runAfterFirstPaint(callback) {
  const run = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 1600 });
      return;
    }
    window.setTimeout(callback, 900);
  };

  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

function hasSupabaseReadConfig() {
  const supabaseConfig = window.KEDIAMANKU_SUPABASE || {};
  return Boolean(
    supabaseConfig.restUrl &&
      supabaseConfig.anonKey &&
      !supabaseConfig.anonKey.includes("PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE")
  );
}

function createPartnerCard(partner, hidden = false) {
  const card = document.createElement(partner.website_url ? "a" : "article");
  card.className = "partner-logo-card";
  card.setAttribute("aria-label", partner.name || "Business Partner");
  if (hidden) card.setAttribute("aria-hidden", "true");
  if (partner.website_url) {
    card.href = partner.website_url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
  }

  if (partner.logo_url) {
    const logo = document.createElement("img");
    logo.className = "partner-logo-image";
    logo.src = partner.logo_url;
    logo.alt = partner.logo_alt || `${partner.name || "Business partner"} logo`;
    logo.loading = "lazy";
    logo.decoding = "async";
    card.append(logo);
  } else {
    const wordmark = document.createElement("span");
    wordmark.className = "partner-logo-wordmark";
    wordmark.textContent = partner.name || "Business Partner";
    card.append(wordmark);
  }

  const label = document.createElement("p");
  label.textContent = partner.label || "Business Partner";
  card.append(label);
  return card;
}

async function loadBusinessPartners() {
  if (!partnerTrack || !hasSupabaseReadConfig()) return;
  const supabaseConfig = window.KEDIAMANKU_SUPABASE;
  const query = new URLSearchParams({
    select: "id,name,label,logo_url,logo_alt,website_url,sort_order,created_at",
    is_published: "eq.true",
    order: "sort_order.asc,created_at.asc",
  });

  try {
    const response = await fetch(`${supabaseConfig.restUrl}/business_partners?${query}`, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
      },
    });
    if (!response.ok) throw new Error(`Business partners failed: ${response.status}`);
    const partners = await response.json();
    if (!Array.isArray(partners) || !partners.length) return;

    const repeatedPartners = partners.length < 6
      ? Array.from({ length: Math.ceil(6 / partners.length) }, () => partners).flat()
      : partners;
    partnerTrack.replaceChildren(
      ...repeatedPartners.map((partner) => createPartnerCard(partner, true)),
      ...repeatedPartners.map((partner) => createPartnerCard(partner))
    );
  } catch (error) {
    console.warn(error);
  }
}

runAfterFirstPaint(loadBusinessPartners);

function createHomeServiceCard(service, index) {
  const card = document.createElement("a");
  card.className = "service-discovery-card";
  card.href = service.link_url || "#services";

  const number = document.createElement("span");
  number.textContent = String(service.display_number || index + 1).padStart(2, "0");

  const image = document.createElement("img");
  image.decoding = "async";
  image.loading = "lazy";
  image.src = service.image_url || "/assets/images/hero-kitchen-living.webp";
  image.alt = service.image_alt || `${service.title || "Interior service"} by Kediamanku`;

  const title = document.createElement("h3");
  title.textContent = service.title || "Interior Service";

  const description = document.createElement("p");
  description.textContent = service.description || "Custom interior design and build service.";

  card.append(number, image, title, description);
  return card;
}

async function loadHomeServiceCards() {
  if (!homeServiceGrid || !hasSupabaseReadConfig()) return;
  const supabaseConfig = window.KEDIAMANKU_SUPABASE;
  const query = new URLSearchParams({
    select: "id,title,description,image_url,image_alt,link_url,display_number,sort_order,created_at",
    is_published: "eq.true",
    order: "sort_order.asc,created_at.asc",
  });

  try {
    const response = await fetch(`${supabaseConfig.restUrl}/home_service_cards?${query}`, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
      },
    });
    if (!response.ok) throw new Error(`Home service cards failed: ${response.status}`);
    const services = await response.json();
    if (!Array.isArray(services) || !services.length) return;
    homeServiceGrid.replaceChildren(...services.map(createHomeServiceCard));
  } catch (error) {
    console.warn(error);
  }
}

runAfterFirstPaint(loadHomeServiceCards);

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("is-open");
    mobileMenu.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("is-open");
      mobileMenu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    });
  });
}

if (servicesToggle && servicesMenu) {
  servicesToggle.addEventListener("click", () => {
    const isOpen = servicesMenu.classList.toggle("is-open");
    servicesToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!servicesMenu.contains(event.target) && !servicesToggle.contains(event.target)) {
      servicesMenu.classList.remove("is-open");
      servicesToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function activateServicePanel(panelToActivate, shouldFocus = false) {
  servicePanels.forEach((panel) => {
    const isActive = panel === panelToActivate;
    panel.classList.toggle("is-active", isActive);
    panel.setAttribute("aria-expanded", String(isActive));
  });

  if (shouldFocus) {
    panelToActivate.focus({ preventScroll: true });
  }
}

servicePanels.forEach((panel, index) => {
  panel.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    activateServicePanel(panel);
  });

  panel.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateServicePanel(panel);
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      activateServicePanel(servicePanels[(index + 1) % servicePanels.length], true);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      activateServicePanel(servicePanels[(index - 1 + servicePanels.length) % servicePanels.length], true);
    }
  });
});

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealSections.forEach((section, index) => {
    section.classList.add("reveal-section");
    section.style.transitionDelay = `${Math.min(index * 55, 220)}ms`;
    sectionObserver.observe(section);
  });
} else {
  revealSections.forEach((section) => {
    section.classList.add("reveal-section", "is-visible");
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopPointer = window.matchMedia("(min-width: 821px) and (hover: hover)");

const projectDetails = {};

function hasSupabaseContentConfig() {
  const supabaseConfig = window.KEDIAMANKU_SUPABASE || {};
  return Boolean(
    supabaseConfig.restUrl &&
    supabaseConfig.anonKey &&
    !supabaseConfig.anonKey.includes("PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE")
  );
}

function resolveHomeImagePath(path) {
  if (!path) return "assets/images/hero-kitchen-living.webp";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  if (path.startsWith("../")) return path.replace("../", "");
  if (path.startsWith("./")) return path.replace("./", "");
  if (path.startsWith("/")) return path.slice(1);
  return path;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mapHomeProject(row) {
  const id = row.slug || row.id;
  const detailSlug = row.slug || row.id || "";
  const isFileMode = window.location.protocol === "file:";
  return {
    id,
    title: row.title,
    category: row.category || "Interior Project",
    description: row.area_scope || "Custom interior project by Kediamanku.",
    type: row.category || "Custom Interior",
    size: row.area_scope || "Custom scope",
    color: "Custom material direction",
    location: row.location || "-",
    materials: row.materials || "-",
    image: resolveHomeImagePath(row.image_url),
    alt: row.image_alt || `${row.title} project by Kediamanku`,
    detailUrl: detailSlug
      ? isFileMode
        ? `projects/detail/index.html?slug=${encodeURIComponent(detailSlug)}`
        : `projects/${encodeURIComponent(detailSlug)}/`
      : "projects/index.html",
    features: [
      row.area_scope || "Designed around the homeowner's space and daily function.",
      row.materials || "Material and finishing direction selected with care.",
      "Built through Kediamanku's design and build process.",
    ],
  };
}

async function fetchHomeProjects() {
  if (!hasSupabaseContentConfig()) return [];

  const supabaseConfig = window.KEDIAMANKU_SUPABASE;
  const query = new URLSearchParams({
    select: "id,slug,title,category,location,area_scope,materials,image_url,image_alt,is_featured,sort_order,created_at",
    is_published: "eq.true",
    order: "is_featured.desc,sort_order.asc,created_at.desc",
    limit: "2",
  });

  const response = await fetch(`${supabaseConfig.restUrl}/projects?${query}`, {
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase homepage projects request failed: ${response.status}`);
  }

  const rows = await response.json();
  return rows.map(mapHomeProject);
}

function createHomeProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-showcase-card";
  article.innerHTML = `
    <a class="project-card-button" href="${escapeHtml(project.detailUrl)}" aria-label="View ${escapeHtml(project.title)} project detail">
      <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.alt)}" loading="lazy" width="1200" height="900">
      <div class="project-info-bar">
        <div>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.description)}</p>
        </div>
        <span class="project-arrow" aria-hidden="true">&nearr;</span>
      </div>
    </a>
  `;
  return article;
}

async function renderHomeProjects() {
  if (!homeProjectGrid) return;

  try {
    const projects = await fetchHomeProjects();
    homeProjectGrid.innerHTML = "";

    if (!projects.length) {
      if (homeProjectEmpty) {
        homeProjectGrid.append(homeProjectEmpty);
        homeProjectEmpty.hidden = false;
      }
      return;
    }

    projects.forEach((project) => {
      projectDetails[project.id] = project;
      homeProjectGrid.append(createHomeProjectCard(project));
    });
  } catch (error) {
    console.warn(error);
    if (homeProjectEmpty) {
      homeProjectEmpty.hidden = false;
    }
  }
}

runAfterFirstPaint(renderHomeProjects);

if (servicesShowcase && serviceImages.length && !reduceMotion.matches && desktopPointer.matches) {
  servicesShowcase.addEventListener("mousemove", (event) => {
    const activePanel = document.querySelector("[data-service-panel].is-active");
    const activeImage = activePanel?.querySelector("[data-service-image]");
    if (!activeImage) return;

    const rect = activePanel.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    activeImage.style.setProperty("--service-parallax-x", `${(x * 12).toFixed(2)}px`);
    activeImage.style.setProperty("--service-parallax-y", `${(y * 8).toFixed(2)}px`);
  });

  servicesShowcase.addEventListener("mouseleave", () => {
    serviceImages.forEach((image) => {
      image.style.setProperty("--service-parallax-x", "0px");
      image.style.setProperty("--service-parallax-y", "0px");
    });
  });
}

if (testimonialSection && testimonialFloatCards.length && !reduceMotion.matches && desktopPointer.matches) {
  testimonialSection.addEventListener("mousemove", (event) => {
    const rect = testimonialSection.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    testimonialFloatCards.forEach((card) => {
      const strength = Number(card.dataset.parallax || 4);
      card.style.setProperty("--parallax-x", `${(x * strength).toFixed(2)}px`);
      card.style.setProperty("--parallax-y", `${(y * strength).toFixed(2)}px`);
    });
  });

  testimonialSection.addEventListener("mouseleave", () => {
    testimonialFloatCards.forEach((card) => {
      card.style.setProperty("--parallax-x", "0px");
      card.style.setProperty("--parallax-y", "0px");
    });
  });
}

if (benefitsSection && benefitImages.length && !reduceMotion.matches && desktopPointer.matches) {
  benefitsSection.addEventListener("mousemove", (event) => {
    const rect = benefitsSection.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    benefitImages.forEach((image) => {
      const strength = Number(image.dataset.parallax || 4);
      image.style.setProperty("--benefit-parallax-x", `${(x * strength).toFixed(2)}px`);
      image.style.setProperty("--benefit-parallax-y", `${(y * strength).toFixed(2)}px`);
    });
  });

  benefitsSection.addEventListener("mouseleave", () => {
    benefitImages.forEach((image) => {
      image.style.setProperty("--benefit-parallax-x", "0px");
      image.style.setProperty("--benefit-parallax-y", "0px");
    });
  });
}

if (projectCarousel) {
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let dragged = false;

  projectCarousel.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("a:focus-visible")) return;
    isDragging = true;
    dragged = false;
    startX = event.clientX;
    startScrollLeft = projectCarousel.scrollLeft;
    projectCarousel.classList.add("is-dragging");
    projectCarousel.setPointerCapture(event.pointerId);
  });

  projectCarousel.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const delta = event.clientX - startX;

    if (Math.abs(delta) > 6) {
      dragged = true;
    }

    projectCarousel.scrollLeft = startScrollLeft - delta;
  });

  function endProjectDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    projectCarousel.classList.remove("is-dragging");

    if (projectCarousel.hasPointerCapture(event.pointerId)) {
      projectCarousel.releasePointerCapture(event.pointerId);
    }
  }

  projectCarousel.addEventListener("pointerup", endProjectDrag);
  projectCarousel.addEventListener("pointercancel", endProjectDrag);
  projectCarousel.addEventListener("click", (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  }, true);
}

if (workTrack && workCards.length) {
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let dragged = false;
  let scrollFrame = null;

  function setActiveWorkCard(activeIndex) {
    workCards.forEach((card, index) => {
      card.classList.toggle("is-active", index === activeIndex);
    });

    workDots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });

    if (workProgressFill) {
      const progress = workCards.length > 1 ? (activeIndex + 1) / workCards.length : 1;
      workProgressFill.style.transform = `scaleX(${progress})`;
    }
  }

  function updateActiveWorkCard() {
    const trackRect = workTrack.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let activeIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    workCards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(trackCenter - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });

    setActiveWorkCard(activeIndex);
  }

  function scheduleWorkUpdate() {
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
    }

    scrollFrame = requestAnimationFrame(updateActiveWorkCard);
  }

  workDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      workCards[index]?.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
      setActiveWorkCard(index);
    });
  });

  workTrack.addEventListener("scroll", scheduleWorkUpdate, { passive: true });

  workTrack.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    isDragging = true;
    dragged = false;
    startX = event.clientX;
    startScrollLeft = workTrack.scrollLeft;
    workTrack.classList.add("is-dragging");
    workTrack.setPointerCapture(event.pointerId);
  });

  workTrack.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const delta = event.clientX - startX;

    if (Math.abs(delta) > 6) {
      dragged = true;
    }

    workTrack.scrollLeft = startScrollLeft - delta;
  });

  function endWorkDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    workTrack.classList.remove("is-dragging");
    scheduleWorkUpdate();

    if (workTrack.hasPointerCapture(event.pointerId)) {
      workTrack.releasePointerCapture(event.pointerId);
    }
  }

  workTrack.addEventListener("pointerup", endWorkDrag);
  workTrack.addEventListener("pointercancel", endWorkDrag);
  workTrack.addEventListener("click", (event) => {
    if (!dragged) return;
    event.preventDefault();
    event.stopPropagation();
    dragged = false;
  }, true);

  updateActiveWorkCard();
}

if (projectModal) {
  let lastProjectTrigger = null;

  function setProjectModal(project) {
    projectModal.querySelector("[data-project-modal-category]").textContent = project.category;
    projectModal.querySelector("[data-project-modal-title]").textContent = project.title;
    projectModal.querySelector("[data-project-modal-description]").textContent = project.description;
    projectModal.querySelector("[data-project-modal-type]").textContent = project.type;
    projectModal.querySelector("[data-project-modal-size]").textContent = project.size;
    projectModal.querySelector("[data-project-modal-color]").textContent = project.color;
    projectModal.querySelector("[data-project-modal-location]").textContent = project.location;
    projectModal.querySelector("[data-project-modal-materials]").textContent = project.materials;

    const image = projectModal.querySelector("[data-project-modal-image]");
    image.src = project.image;
    image.alt = project.alt;

    const featureList = projectModal.querySelector("[data-project-modal-features]");
    featureList.innerHTML = "";
    project.features.forEach((feature) => {
      const item = document.createElement("li");
      item.textContent = feature;
      featureList.append(item);
    });
  }

  function openProjectModal(projectKey, trigger) {
    const project = projectDetails[projectKey];
    if (!project) return;

    lastProjectTrigger = trigger;
    setProjectModal(project);
    projectModal.classList.add("is-open");
    projectModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-modal-open");
    projectModal.querySelector(".project-modal-close").focus();
  }

  function closeProjectModal() {
    projectModal.classList.remove("is-open");
    projectModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-modal-open");
    lastProjectTrigger?.focus({ preventScroll: true });
  }

  function keepProjectModalFocus(event) {
    if (event.key !== "Tab" || !projectModal.classList.contains("is-open")) return;

    const focusable = [...projectModal.querySelectorAll("button, a")]
      .filter((element) => !element.disabled && element.offsetParent !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  projectTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openProjectModal(trigger.dataset.projectTrigger, trigger);
    });
  });

  if (projectCarousel) {
    projectCarousel.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-project-trigger]");
      if (!trigger) return;
      openProjectModal(trigger.dataset.projectTrigger, trigger);
    });
  }

  projectModalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeProjectModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectModal.classList.contains("is-open")) {
      closeProjectModal();
    }

    keepProjectModalFocus(event);
  });
}
