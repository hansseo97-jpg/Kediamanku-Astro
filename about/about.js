const revealItems = document.querySelectorAll("[data-reveal], [data-stagger]");
const statSection = document.querySelector("[data-stats]");
const statNumbers = document.querySelectorAll("[data-count]");
const parallaxImages = document.querySelectorAll("[data-parallax]");
const highlightItems = document.querySelectorAll(".highlight-item[data-highlight-description]");
const highlightsGrid = document.querySelector(".highlights-grid");
const highlightDescription = document.querySelector(".highlight-description");
const highlightDescriptionText = document.querySelector("[data-highlight-description-text]");
const highlightDescriptionKicker = document.querySelector(".highlight-description-kicker");
const teamGrid = document.querySelector("[data-team-grid]");
const leadModal = document.querySelector("[data-lead-modal]");
const openLeadModalButtons = document.querySelectorAll("[data-open-lead-modal]");
const closeLeadModalButtons = document.querySelectorAll("[data-close-lead-modal]");
const leadForm = document.querySelector("[data-lead-form]");
const leadStatus = document.querySelector("[data-lead-status]");
const leadStartedInput = document.querySelector("[data-form-started-at]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastLeadTrigger = null;
let leadFormStartedAt = "";
let highlightAnimationTimer = 0;

function getSupabaseConfig() {
  return window.KEDIAMANKU_SUPABASE || {};
}

function hasSupabaseConfig(config = getSupabaseConfig()) {
  return Boolean(
    config.restUrl &&
    config.anonKey &&
    !config.anonKey.includes("PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE")
  );
}

function revealElement(element) {
  element.classList.add("is-visible");
}

function setLeadStatus(message, type = "") {
  if (!leadStatus) return;
  leadStatus.textContent = message;
  leadStatus.classList.toggle("is-error", type === "error");
  leadStatus.classList.toggle("is-success", type === "success");
}

function markLeadFormStarted() {
  leadFormStartedAt = new Date().toISOString();
  if (leadStartedInput) {
    leadStartedInput.value = leadFormStartedAt;
  }
}

function openLeadModal(trigger) {
  if (!leadModal) return;
  lastLeadTrigger = trigger || document.activeElement;
  markLeadFormStarted();
  leadModal.classList.add("is-open");
  leadModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("lead-modal-open");
  setLeadStatus("");

  window.setTimeout(() => {
    leadModal.querySelector('input[name="name"]')?.focus();
  }, 180);
}

function closeLeadModal() {
  if (!leadModal) return;
  leadModal.classList.remove("is-open");
  leadModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lead-modal-open");
  lastLeadTrigger?.focus?.({ preventScroll: true });
}

function keepLeadModalFocus(event) {
  if (!leadModal?.classList.contains("is-open") || event.key !== "Tab") return;

  const focusable = [...leadModal.querySelectorAll("button, a, input, select, textarea")]
    .filter((element) => !element.disabled && element.tabIndex !== -1 && element.offsetParent !== null);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function hasSupabaseLeadConfig() {
  return hasSupabaseConfig();
}

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!hasSupabaseLeadConfig()) {
      setLeadStatus("Supabase belum dikonfigurasi. Hubungi Kediamanku lewat kontak utama dulu.", "error");
      return;
    }

    const formData = new FormData(leadForm);
    const startedAt = formData.get("form_started_at") || leadFormStartedAt;
    const honeypot = String(formData.get("website") || "").trim();

    if (honeypot) {
      setLeadStatus("Thank you. Your inquiry has been received.", "success");
      window.setTimeout(closeLeadModal, 900);
      return;
    }

    if (!startedAt || Date.now() - Date.parse(startedAt) < 3000) {
      setLeadStatus("Please wait a moment before submitting.", "error");
      return;
    }

    const payload = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      service_interest: formData.get("service_interest"),
      message: String(formData.get("message") || "").trim(),
      source: "about-page",
      website: honeypot,
      form_started_at: startedAt,
      user_agent: navigator.userAgent.slice(0, 240),
    };

    try {
      const supabaseConfig = getSupabaseConfig();
      setLeadStatus("Sending your project inquiry...");
      const response = await fetch(`${supabaseConfig.restUrl}/leads`, {
        method: "POST",
        headers: {
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${supabaseConfig.anonKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Lead request failed: ${response.status}`);
      }

      leadForm.reset();
      markLeadFormStarted();
      setLeadStatus("Thank you. Your inquiry has been saved and will be reviewed.", "success");
      window.setTimeout(closeLeadModal, 1300);
    } catch (error) {
      console.warn(error);
      setLeadStatus("Inquiry could not be saved yet. Please try again later.", "error");
    }
  });
}

openLeadModalButtons.forEach((button) => {
  button.addEventListener("click", () => openLeadModal(button));
});

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href="#contact"]');
  if (!link || !leadModal) return;

  event.preventDefault();
  history.replaceState(null, "", "#contact");
  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => openLeadModal(link), 260);
});

closeLeadModalButtons.forEach((button) => {
  button.addEventListener("click", closeLeadModal);
});

if (window.location.hash === "#contact" && leadModal) {
  window.setTimeout(() => openLeadModal(), 450);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && leadModal?.classList.contains("is-open")) {
    closeLeadModal();
  }

  keepLeadModalFocus(event);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
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
  revealItems.forEach(revealElement);
}

function animateCount(element) {
  const target = Number(element.dataset.count || 0);
  const duration = 1300;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toLocaleString("en-US");

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

if (statSection && statNumbers.length) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    statNumbers.forEach((number) => {
      number.textContent = Number(number.dataset.count || 0).toLocaleString("en-US");
    });
  } else {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            statNumbers.forEach(animateCount);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.45 }
    );

    statObserver.observe(statSection);
  }
}

function setActiveHighlight(item) {
  if (!item || !highlightDescriptionText || !highlightDescriptionKicker) return;

  const items = [...highlightItems];
  const index = items.indexOf(item);
  if (index < 0) return;

  const number = item.querySelector(".highlight-number")?.textContent?.trim() || String(index + 1).padStart(2, "0");
  const title = item.dataset.highlightTitle || item.querySelector("h3")?.textContent?.replace(/\s+/g, " ").trim() || "Studio Highlight";
  const description = item.dataset.highlightDescription || "";
  const motionElements = [...items, highlightDescription].filter(Boolean);
  const firstRects = reduceMotion
    ? new Map()
    : new Map(motionElements.map((element) => [element, element.getBoundingClientRect()]));

  window.clearTimeout(highlightAnimationTimer);

  items.forEach((highlight) => {
    const isActive = highlight === item;
    highlight.classList.toggle("is-active", isActive);
    highlight.setAttribute("aria-pressed", String(isActive));
  });

  highlightDescription?.classList.add("is-changing");
  highlightsGrid?.classList.add("is-repositioning");
  window.setTimeout(() => {
    highlightsGrid?.classList.remove("active-highlight-1", "active-highlight-2", "active-highlight-3");
    highlightsGrid?.classList.add(`active-highlight-${index + 1}`);
    highlightDescriptionKicker.textContent = `${number} / ${title}`;
    highlightDescriptionText.textContent = description;

    if (!reduceMotion) {
      motionElements.forEach((element) => {
        const first = firstRects.get(element);
        if (!first) return;

        const last = element.getBoundingClientRect();
        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;
        if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

        element.style.transition = "none";
        element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });
    }

    window.requestAnimationFrame(() => {
      if (!reduceMotion) {
        motionElements.forEach((element) => {
          element.style.transition =
            "transform 640ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease, max-height 320ms cubic-bezier(0.22, 1, 0.36, 1)";
          element.style.transform = "";
        });
      }

      highlightAnimationTimer = window.setTimeout(() => {
        highlightDescription?.classList.remove("is-changing");
        highlightsGrid?.classList.remove("is-repositioning");
        window.setTimeout(() => {
          motionElements.forEach((element) => {
            element.style.transition = "";
            element.style.transform = "";
          });
        }, reduceMotion ? 0 : 680);
      }, reduceMotion ? 0 : 260);
    });
  }, reduceMotion ? 0 : 160);
}

highlightItems.forEach((item) => {
  item.addEventListener("click", () => setActiveHighlight(item));
  item.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setActiveHighlight(item);
  });
});

function updateParallax() {
  if (reduceMotion || !parallaxImages.length || window.innerWidth < 900) return;

  parallaxImages.forEach((wrap) => {
    const image = wrap.querySelector("img");
    if (!image) return;

    const rect = wrap.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const strength = Number(wrap.dataset.parallax || 8);
    const offset = ((center - viewportCenter) / window.innerHeight) * strength;

    image.style.transform = `translateY(${offset.toFixed(2)}px) scale(1.035)`;
  });
}

if (parallaxImages.length && !reduceMotion) {
  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", updateParallax);
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function isConfigured(config = getSupabaseConfig()) {
  return hasSupabaseConfig(config);
}

function waitForSupabaseConfig(maxAttempts = 16) {
  return new Promise((resolve) => {
    let attempt = 0;

    function check() {
      const config = getSupabaseConfig();
      if (isConfigured(config) || attempt >= maxAttempts) {
        resolve(config);
        return;
      }

      attempt += 1;
      window.setTimeout(check, 125);
    }

    check();
  });
}

function resolveImageUrl(value) {
  const url = String(value || "").trim();
  if (!url || /^(javascript|data|vbscript):/i.test(url)) {
    return "../assets/images/team-founder.svg";
  }

  if (/^https?:\/\//i.test(url) || url.startsWith("../") || url.startsWith("./") || url.startsWith("/")) {
    return url;
  }

  return `../${url.replace(/^\/+/, "")}`;
}

function getFallbackTeamMembers() {
  return [
    {
      name: "Studio Founder",
      role: "Founder & Design Direction",
      bio: "Leads the design vision with a focus on proportion, warm materials, and interiors that feel personal over time.",
      image_url: "../assets/images/team-founder.svg",
      image_alt: "Founder and design director at Kediamanku",
    },
    {
      name: "Interior Designer",
      role: "Spatial & Material Design",
      bio: "Shapes room layouts, storage needs, color direction, finishes, and the everyday flow of each home.",
      image_url: "../assets/images/team-designer.svg",
      image_alt: "Interior designer at Kediamanku",
    },
    {
      name: "Project Planner",
      role: "Planning & Client Journey",
      bio: "Keeps measurements, timelines, consultation notes, and technical requirements aligned from first brief to installation.",
      image_url: "../assets/images/team-planner.svg",
      image_alt: "Project planner at Kediamanku",
    },
    {
      name: "Workshop Lead",
      role: "Production & Installation Quality",
      bio: "Coordinates build details, finishing precision, hardware checks, and the final fit of each custom interior element.",
      image_url: "../assets/images/team-production.svg",
      image_alt: "Production workshop lead at Kediamanku",
    },
  ];
}

function formatTeamNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function createTeamName(name) {
  const heading = createElement("h2", "team-name");
  const cleanName = String(name || "Team Member").trim();
  heading.setAttribute("aria-label", cleanName);

  cleanName.split(/\s+/).forEach((part) => {
    const mask = createElement("span", "team-name-line");
    mask.append(createElement("span", "", part));
    heading.append(mask);
  });

  return heading;
}

function renderTeamMembers(members, source = "fallback") {
  if (!teamGrid) return;

  const visibleMembers = members.length ? members : getFallbackTeamMembers();
  teamGrid.dataset.teamSource = members.length ? source : `${source}-fallback`;

  teamGrid.replaceChildren();
  visibleMembers.forEach((member, index) => {
    const card = createElement("article", "team-member-card");

    const imageWrap = createElement("div", "team-image");
    const image = document.createElement("img");
    image.src = resolveImageUrl(member.image_url);
    image.alt = member.image_alt || `Portrait of ${member.name} from Kediamanku`;
    image.width = 640;
    image.height = 820;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.src = "../assets/images/team-founder.svg";
    }, { once: true });
    imageWrap.append(image);

    const copy = createElement("div", "team-content");
    copy.append(createElement("span", "team-number", formatTeamNumber(index)));
    copy.append(createTeamName(member.name || "Team Member"));
    copy.append(createElement("p", "team-role", member.role || "Kediamanku Team"));
    copy.append(createElement("p", "team-description", member.bio || "Part of the Kediamanku design and build team."));

    card.append(imageWrap, copy);
    teamGrid.append(card);
  });
}

async function loadTeamMembers() {
  if (!teamGrid) return;
  const supabaseConfig = await waitForSupabaseConfig();

  if (!isConfigured(supabaseConfig)) {
    renderTeamMembers(getFallbackTeamMembers(), "local-config-missing");
    return;
  }

  try {
    const query = new URLSearchParams({
      select: "slug,name,role,bio,image_url,image_alt,sort_order,created_at",
      is_published: "eq.true",
      order: "sort_order.asc,created_at.asc",
      limit: "12",
    });
    const endpoint = `${supabaseConfig.restUrl}/team_members?${query}`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Team data could not be loaded yet. Status ${response.status}`);
    }

    const members = await response.json();
    const publishedMembers = Array.isArray(members) ? members : [];
    renderTeamMembers(publishedMembers, publishedMembers.length ? "supabase" : "supabase-empty");
  } catch (error) {
    console.warn(error);
    renderTeamMembers(getFallbackTeamMembers(), "supabase-error");
  }
}

loadTeamMembers();
