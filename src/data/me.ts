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
  tagline: string; // one-line pitch
  description: string; // 2–3 sentences
  tech: string[];
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

// ⚠️ MOCK DATA — replace with your real details.
export const me: Me = {
  name: "Alex Doe",
  role: "Engineering student & creative web developer",
  degree: "B.Tech in Computer Science",
  college: "Example Institute of Technology",
  gradYear: "2027",
  location: "Bengaluru, India",
  bio: "I'm an engineering student who likes building things that feel alive on the web — smooth motion, playful physics, and interfaces that respond to you. I care about the small details that make software feel handcrafted.",
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
      slug: "motion-lab",
      title: "Motion Lab",
      tagline: "A playground for scroll-driven web animations.",
      description:
        "An interactive gallery of GSAP + Lenis experiments — scroll reveals, pinned sections, and physics toys. Built to teach myself production-grade motion techniques.",
      tech: ["Next.js", "GSAP", "Lenis", "TypeScript"],
      links: [
        { label: "Live", href: "https://example.com/motion-lab" },
        { label: "GitHub", href: "https://github.com/example/motion-lab" },
      ],
    },
    {
      slug: "study-buddy",
      title: "StudyBuddy",
      tagline: "AI flashcards that adapt to how you learn.",
      description:
        "A spaced-repetition study app that generates flashcards from your notes and tunes review intervals to your recall. Full-stack with a streaming AI backend.",
      tech: ["React", "Node.js", "PostgreSQL", "Vercel AI SDK"],
      links: [
        { label: "Live", href: "https://example.com/study-buddy" },
        { label: "GitHub", href: "https://github.com/example/study-buddy" },
      ],
    },
    {
      slug: "campus-maps",
      title: "Campus Maps",
      tagline: "Real-time indoor navigation for my college.",
      description:
        "A wayfinding PWA that routes students between rooms across buildings using a hand-built graph and A* pathfinding, with offline support.",
      tech: ["React", "TypeScript", "Leaflet", "IndexedDB"],
      links: [
        { label: "GitHub", href: "https://github.com/example/campus-maps" },
      ],
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
  email: "alex.doe@example.com",
};
