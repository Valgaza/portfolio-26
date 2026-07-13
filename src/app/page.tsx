import Showcase from "@/components/sections/Showcase";
import Experience from "@/components/sections/Experience";
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

// Single-page portfolio. Order: Showcase (hero + about + projects), Experience,
// Skills, AI Chat, Contact, Footer. AI Chat (a later step) is a placeholder.
export default function Home() {
  // Projects come from `content/projects/*.json` (folder-driven — add a file to
  // add a card). Loaded here on the server and passed into the client Showcase.
  const projects = getProjects();

  return (
    <main className="flex flex-col">
      <Showcase projects={projects} />
      <Experience />
      <Skills />
      <Placeholder id="chat" label="AI Chat" />
      <Contact />
      <Footer />
    </main>
  );
}
