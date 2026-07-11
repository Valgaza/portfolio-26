/**
 * Single source of truth for all personal content.
 *
 * Everything the site shows AND everything the AI chat knows comes from
 * this file. The values below are PLACEHOLDER / MOCK data so we can build
 * and test every section — swap them for your real details anytime; keep
 * the shapes intact since the section components and the /api/chat system
 * prompt consume these keys.
 */

export type SkillGroup = {
  category: string; // e.g. "Languages", "Frameworks", "Tools"
  items: string[]; // become the falling Matter.js tags
};

export type Project = {
  slug: string;
  title: string;
  tagline: string; // one-line pitch (used by the compact ProjectCard / AI chat)
  category: string; // shown as the section label, e.g. "Ecommerce Website"
  description: string; // 2–3 sentences
  tech: string[];
  status?: "live" | "in-progress"; // controls the CTA (Visit Site vs In Progress)
  links: { label: string; href: string }[]; // live demo, GitHub, etc.
};

export type SocialLink = {
  label: string; // "GitHub", "LinkedIn", "Email"
  href: string;
};

export type Me = {
  name: string;
  role: string; // e.g. "Engineering student & web developer"
  degree: string;
  college: string;
  gradYear: string;
  location: string;
  bio: string; // a short paragraph in your own voice
  skills: SkillGroup[];
  projects: Project[];
  funFacts: string[];
  socials: SocialLink[];
  email: string;
};

// ⚠️ DESIGN-TO-CODE STUDY — content mirrors the Roshan Sahu portfolio we're
// faithfully rebuilding (credited in the footer). Swap for your own details to
// make it yours.
export const me: Me = {
  name: "Roshan Sahu",
  role: "web developer and engineer",
  degree: "B.Tech in Computer Science",
  college: "Example Institute of Technology",
  gradYear: "2027",
  location: "India",
  bio: "I blend design, strategy, and engineering to create seamless digital experiences. With over six years of experience including time at Bosch, I've built stable, intelligent products for the medical and industrial sectors. Today, I bring that expertise to startups and agencies as a creative developer.",
  skills: [
    {
      category: "Languages",
      items: ["TypeScript", "JavaScript", "Python", "C++", "SQL"],
    },
    {
      category: "Frameworks",
      items: ["React", "Next.js", "Node.js", "Tailwind", "GSAP"],
    },
    {
      category: "Tools",
      items: ["Git", "Figma", "Vercel", "Docker", "Postman"],
    },
  ],
  projects: [
    {
      slug: "modevelle",
      title: "Modevelle",
      tagline: "A women's fashion storefront.",
      category: "Ecommerce Website",
      description:
        "A demo e-commerce website for women's fashion, featuring product listings, cart functionality, and user authentication. Built using Next.js and the Shopify Storefront API.",
      tech: ["Next.js", "Shopify Storefront API", "GSAP"],
      status: "live",
      links: [{ label: "Visit Site", href: "#" }],
    },
    {
      slug: "the-shear-room",
      title: "The Shear Room",
      tagline: "End-to-end salon booking.",
      category: "Booking Website",
      description:
        "A demo booking website for a unisex salon brand, including service and pricing displays, an end-to-end booking workflow, and user authentication. Built with Next.js and Supabase.",
      tech: ["Next.js", "Supabase", "GSAP"],
      status: "live",
      links: [{ label: "Visit Site", href: "#" }],
    },
    {
      slug: "photographer",
      title: "Photographer",
      tagline: "A minimal photography portfolio.",
      category: "Portfolio Website",
      description:
        "A demo portfolio website for a professional photographer, Jayesh Malhotra, designed to showcase visual work through a minimal, elegant layout. Developed using the no-code platform Webflow.",
      tech: ["Webflow", "No-Code", "GSAP"],
      status: "live",
      links: [{ label: "Visit Site", href: "#" }],
    },
    {
      slug: "katalog",
      title: "Katalog",
      tagline: "Furniture, lighting & hardware store.",
      category: "Ecommerce Website",
      description:
        "An e-commerce website for furniture, lighting, and hardware, currently in development. Being built as a custom Shopify theme using Liquid.",
      tech: ["Shopify", "Liquid", "GSAP"],
      status: "in-progress",
      links: [],
    },
  ],
  funFacts: [
    "I once wrote a Python bot that reminds me to drink water — and then ignored it for a month.",
    "I collect mechanical keyboard switches and can rank them by sound.",
    "I learned to code because I wanted to mod games.",
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/example" },
    { label: "LinkedIn", href: "https://linkedin.com/in/example" },
  ],
  email: "hello.roshansahu@gmail.com",
};
