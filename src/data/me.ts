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

export type Me = {
  name: string;
  role: string; // e.g. "Engineering student & web developer"
  degree: string;
  college: string;
  gradYear: string;
  location: string;
  bio: string; // a short paragraph in your own voice
  skills: SkillGroup[];
  experiences: Experience[]; // ordered left-to-right on the Experience timeline
  projects: Project[];
  funFacts: string[];
  socials: SocialLink[];
  email: string;
};

// Real content for Aarya Patil (sourced from AaryaPatil_CV.pdf). NOTE: the visual
// DESIGN is still a study of the Roshan Sahu portfolio — that attribution stays
// in the footer; only the CONTENT below is personalised.
export const me: Me = {
  name: "Aarya Patil",
  role: "computer engineering student and AI/ML developer",
  degree: "B.Tech in Computer Engineering",
  college: "K. J. Somaiya College of Engineering",
  gradYear: "2027",
  location: "Mumbai, India",
  bio: "I build AI systems that make it to production — retrieval-augmented platforms, computer-vision pipelines, and NLP tooling. Through internships at PwC, Amnex, and Fostride, I've turned research-grade models into software people actually use, and I care as much about the engineering around a model as the model itself.",
  skills: [
    {
      category: "Languages",
      items: ["Python", "C++", "Java", "SQL", "JavaScript"],
    },
    {
      category: "ML / AI",
      items: ["RAG", "Transformers", "NLP", "Tool-Calling Agents", "TFT"],
    },
    {
      category: "Computer Vision",
      items: ["YOLOv8", "DINOv2", "OpenCV", "Pytesseract"],
    },
    {
      category: "LLMs & Serving",
      items: ["Llama", "Mistral", "Gemma", "vLLM", "Hugging Face"],
    },
    {
      category: "Frameworks & Tools",
      items: [
        "PyTorch",
        "TensorFlow",
        "FastAPI",
        "Flask",
        "Next.js",
        "React",
        "Git",
        "Docker",
      ],
    },
    {
      category: "Databases & Infra",
      items: [
        "PostgreSQL",
        "Supabase (pgvector)",
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
        "Architected AIRA, a self-hosted enterprise RAG platform over AlloyDB + pgvector with a secured 13-tool agent orchestrator, validated across 187 automated tests.",
      kind: "work",
      location: "India",
    },
  ],
  projects: [
    {
      slug: "trafficos",
      title: "TrafficOS",
      tagline: "Forecasting and untangling traffic.",
      category: "ML System",
      description:
        "A traffic-congestion forecasting system built on a Temporal Fusion Transformer with grid-based heatmap visualization, plus game-theoretic route optimization that redistributes traffic to relieve gridlock at its source.",
      tech: ["Python", "PyTorch", "TFT"],
      status: "live",
      links: [{ label: "View Code", href: "https://github.com/Valgaza" }],
    },
    {
      slug: "indexial",
      title: "Indexial",
      tagline: "Hybrid SQL + RAG query engine.",
      category: "RAG / Search",
      description:
        "A document-QA engine that routes queries across SQL, RAG, and hybrid paths via intent classification, with cross-document semantic search using Jina AI embeddings + pgvector and session-based memory backed by a persistent table registry.",
      tech: ["Python", "pgvector", "Jina AI"],
      status: "live",
      links: [{ label: "View Code", href: "https://github.com/Valgaza" }],
    },
    {
      slug: "hiring-suite",
      title: "Hiring Suite",
      tagline: "An AI-powered hiring workflow.",
      category: "AI / Automation",
      description:
        "An AI hiring workflow that automates resume ingestion and job-fit scoring with Transformers + Gemini — cutting recruiter workload ~70% — and adds soft-skill verification through CV-based emotion recognition.",
      tech: ["Transformers", "Gemini", "Computer Vision"],
      status: "live",
      links: [{ label: "View Code", href: "https://github.com/Valgaza" }],
    },
  ],
  funFacts: [
    "I'm rated 1600+ on LeetCode and reached Pupil on Codeforces.",
    "I completed the DeepLearning.AI Deep Learning Specialization — all four courses.",
    "I built the telemetry stack for my college's Formula Student racing team, Orion Racing.",
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/Valgaza" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aarya-patil" },
  ],
  email: "aaryapatil3004@gmail.com",
};
