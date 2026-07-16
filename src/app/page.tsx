import Showcase from "@/components/sections/Showcase";
import Experience from "@/components/sections/Experience";
import ProjectGallery from "@/components/sections/ProjectGallery";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { getProjects } from "@/lib/projects";

// Single-page portfolio. Order: Showcase (hero + about + featured projects) →
// Experience (pinned timeline) → ProjectGallery (the "more builds" accordion) →
// Skills → Contact → Footer. The AI chat is a floating pill/drawer (fixed), so
// it lives outside the section flow.
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
      <Contact />
      <Footer />
      <ChatWidget />
    </main>
  );
}
