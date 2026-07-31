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
  // add a card). Loaded here on the server and passed to the gallery.
  const projects = getProjects();

  return (
    <main className="flex flex-col">
      <Showcase />
      <Experience />
      <ProjectGallery projects={projects} />
      <Skills />
      {/* Closing CTA + footer share the final screen (Contact grows to fill the
          space above the footer, which sits at the bottom). */}
      <div className="flex min-h-svh flex-col">
        <Contact />
        <Footer />
      </div>
      <ChatWidget />
    </main>
  );
}
