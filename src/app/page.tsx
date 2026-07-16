import Showcase from "@/components/sections/Showcase";
import Experience from "@/components/sections/Experience";
import ProjectGallery from "@/components/sections/ProjectGallery";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import { getProjects } from "@/lib/projects";

// Placeholder for sections not built yet. Removed as each real section lands.
function Placeholder({ id, label }: { id: string; label: string }) {
  return (
    <section
      id={id}
      className="flex min-h-screen items-center justify-center border-b border-white/10"
    >
      <h2 className="text-4xl font-semibold text-muted">{label}</h2>
    </section>
  );
}

// Single-page portfolio. Order: Showcase (hero + about + featured projects) →
// Experience (pinned timeline) → ProjectGallery (the "more builds" accordion) →
// Skills → AI Chat → Contact → Footer. AI Chat is still a placeholder.
export default function Home() {
  // Projects come from `content/projects/*.json` (folder-driven — add a file to
  // add a card). Loaded here on the server and passed to the client sections.
  const projects = getProjects();

  // Showcase spotlights the `"featured": true` subset; the gallery shows all of
  // them. Until any project is flagged, both fall back to the full list.
  const featured = projects.filter((p) => p.featured);
  const spotlight = featured.length ? featured : projects;

  return (
    <main className="flex flex-col">
      <Showcase projects={spotlight} />
      <Experience />
      <ProjectGallery projects={projects} />
      <Skills />
      <Placeholder id="chat" label="AI Chat" />
      <Contact />
      <Footer />
    </main>
  );
}
