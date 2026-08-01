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
  category: string; // section label, e.g. "Languages", "Machine Learning"
  // A group is EITHER a flat list of tools (Languages, Web, Databases) …
  items?: string[];
  // … OR split into labelled sub-rows (e.g. Machine Learning → NLP, CV, Serving).
  subgroups?: { label: string; items: string[] }[];
};

export type Project = {
  slug: string;
  title: string;
  tagline: string; // one-line pitch (used by the compact ProjectCard / AI chat)
  category: string; // shown as the section label, e.g. "Ecommerce Website"
  description: string; // 2–3 sentences
  tech: string[];
  status?: "live" | "in-progress" | "research"; // controls the CTA label
  featured?: boolean; // spotlighted in the pinned <Showcase />; all projects
  // (featured or not) appear in the <ProjectGallery /> accordion.
  links: { label: string; href: string }[]; // live demo, GitHub, etc.
  image?: string; // e.g. "/projects/modevelle.jpg" (a file in /public/projects)
};

export type SocialLink = {
  label: string; // "GitHub", "LinkedIn", "Email"
  href: string;
};

export type Experience = {
  period: string; // "2023 — 2027", "Summer 2025"
  org: string; // company or institution (shown large, as the "specimen")
  title: string; // role or degree
  description: string; // 1–2 sentences
  kind: "work" | "education"; // labels the card ("Experience" / "Education")
  location?: string;
};

// Only the fields the site actually renders live here. The AI chat is grounded
// separately (see src/lib/chat/knowledge.ts), and projects are folder-driven
// (content/projects/*.json via src/lib/projects.ts) — so neither reads `me`.
export type Me = {
  name: string;
  skills: SkillGroup[];
  experiences: Experience[]; // ordered left-to-right on the Experience timeline
  socials: SocialLink[];
  email: string;
};

export const me: Me = {
  name: "Aarya Patil",
  skills: [
    {
      category: "Languages",
      items: ["Python", "C++", "Java", "SQL", "JavaScript"],
    },
    {
      category: "Machine Learning",
      subgroups: [
        {
          label: "NLP / LLM",
          items: [
            "RAG",
            "Transformers",
            "NLP",
            "TFT",
            "Fine-tuning",
            "LoRA / PEFT",
            "Quantization",
          ],
        },
        {
          label: "Computer Vision",
          items: [
            "Object Detection",
            "Image Segmentation",
            "OpenCV",
          ],
        },
        {
          label: "Frameworks & Serving",
          items: ["PyTorch", "TensorFlow", "vLLM", "Hugging Face"],
        },
      ],
    },
    {
      category: "Web & Dev Tools",
      items: ["FastAPI", "Flask", "Next.js", "React", "Git", "Docker"],
    },
    {
      category: "Databases & Infra",
      items: [
        "PostgreSQL",
        "Supabase",
        "AlloyDB",
        "Vector DBs",
        "Redis",
      ],
    },
  ],
  // Ordered chronologically (they render left-to-right along the timeline).
  experiences: [
    {
      period: "2023 — 2027",
      org: "K. J. Somaiya",
      title: "B.Tech, Computer Engineering",
      description:
        "Computer engineering with a 9.32 GPA — coursework across systems, machine learning, and web engineering alongside hands-on project and research work.",
      kind: "education",
      location: "Mumbai, India",
    },
    {
      period: "Feb 2024 — Oct 2024",
      org: "Orion Racing",
      title: "Data Acquisition Engineer",
      description:
        "Built telemetry pipelines streaming 25+ CAN sensors to real-time dashboards at sub-200ms latency, plus anomaly detection for 5× faster post-race diagnostics.",
      kind: "work",
      location: "KJSCE Formula Student",
    },
    {
      period: "May 2025 — Aug 2025",
      org: "PwC India",
      title: "AI/ML Intern",
      description:
        "Shipped a YOLOv8 + OCR pipeline digitising degraded legacy land records, and an NLP system automating multi-department report analysis (2 days → 30 min).",
      kind: "work",
      location: "India",
    },
    {
      period: "Mar 2026 — Apr 2026",
      org: "Fostride",
      title: "Computer Vision Intern",
      description:
        "Engineered a YOLO + DINOv2 waste-classification pipeline for a robotic sorter, plus an end-to-end autolabelling flow targeting Jetson Nano deployment.",
      kind: "work",
      location: "India",
    },
    {
      period: "Jun 2026 — Aug 2026",
      org: "Amnex",
      title: "AI/ML Intern",
      description:
        "Architected AIRA, a self-hosted enterprise RAG platform over AlloyDB + pgvector with a secured 13-tool agent orchestrator",
      kind: "work",
      location: "India",
    },
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/Valgaza" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/valgaza/" },
    { label: "Instagram", href: "https://www.instagram.com/apatil_3004/"},
  ],
  email: "aaryapatil3004@gmail.com",
};
