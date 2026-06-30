import { absoluteUrl } from "./supabase-content.js";

const services = {
  "Kitchen Set": {
    url: "/services/kitchen-set/",
    name: "Kitchen Set Premium",
    description:
      "Premium kitchen set design and build with custom cabinetry, smart storage, countertop, pantry, island planning, and refined finishing.",
    image: "/assets/images/hero-kitchen-living.webp",
    faqs: [
      ["How long does a kitchen set project take?", "Timeline depends on room size, material selection, production complexity, and installation scope. Kediamanku confirms the timeline after consultation and measurement."],
      ["Can the kitchen set be adjusted to my room size?", "Yes. Kediamanku plans cabinetry, storage, appliance placement, and finishing around your actual room dimensions and daily cooking flow."],
      ["Do you include production and installation?", "Yes. Kediamanku supports the process from design direction, measurement, production, and installation."],
    ],
  },
  "Lemari Custom": {
    url: "/services/lemari-custom/",
    name: "Lemari Custom",
    description:
      "Made-to-measure wardrobe and storage systems with sliding doors, walk-in closet planning, drawer systems, display shelves, and refined finishing.",
    image: "/assets/images/custom-wardrobe.webp",
    faqs: [
      ["Can wardrobes be customized to my storage habits?", "Yes. Hanging zones, drawers, shelves, display areas, and accessories can be planned around your daily storage needs."],
      ["Can Kediamanku build a walk-in closet?", "Yes. Kediamanku can plan open and closed storage zones, lighting, display shelves, and dressing routines for walk-in closets."],
      ["Can I choose the finishing?", "Yes. Finishing direction is selected during consultation based on durability, room mood, and the level of display you want."],
    ],
  },
  "Kamar Interior": {
    url: "/services/kamar-interior/",
    name: "Kamar Interior",
    description:
      "Bedroom interior design and build with headboard composition, wardrobe integration, bedside details, lighting ambience, and comfort-focused custom furniture.",
    image: "/assets/images/bedroom-interior.webp",
    faqs: [
      ["Can bedroom furniture be integrated into one design?", "Yes. Headboard, wardrobe, side table, vanity, lighting, and storage can be composed as one calm bedroom system."],
      ["Do you help with lighting ambience?", "Yes. Lighting direction can be planned to support rest, storage access, and a warm bedroom mood."],
      ["Can the design follow my existing room condition?", "Yes. Kediamanku starts from measurement and daily routines before shaping the bedroom layout and finishing."],
    ],
  },
  "Kamar Anak": {
    url: "/services/kamar-anak/",
    name: "Kamar Anak Custom",
    description:
      "Kids bedroom custom interior with bed frame, study desk, toy storage, wardrobe, safer furniture details, and growth-friendly design.",
    image: "/assets/images/kids-bedroom.webp",
    faqs: [
      ["Can the room grow with my child?", "Yes. Kediamanku can keep the base design timeless and use flexible storage, study, and display elements that remain useful over time."],
      ["Can you include study desk and toy storage?", "Yes. Study desks, shelves, toy storage, wardrobe, and bed frame can be planned as one integrated room system."],
      ["Do you consider safety details?", "Yes. Kediamanku discusses circulation, height, edge treatment, access, and practical daily use before production."],
    ],
  },
};

export function getServiceSchemas(key) {
  const service = services[key];
  if (!service) return { serviceSchema: null, faqSchema: null };

  return {
    serviceSchema: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      description: service.description,
      image: absoluteUrl(service.image),
      url: absoluteUrl(service.url),
      serviceType: "Interior Design and Build",
      areaServed: "Indonesia",
      provider: {
        "@type": "LocalBusiness",
        name: "Kediamanku",
        url: absoluteUrl("/"),
        logo: absoluteUrl("/assets/images/logo-kediamanku-transparent.png"),
      },
    },
    faqSchema: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: service.faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    },
  };
}
