import Showcase from "@/components/sections/Showcase";
import Skills from "@/components/sections/Skills";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

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

// Single-page portfolio. Order: Hero, About, Skills, Projects, AI Chat,
// Contact, Footer. AI Chat (a later step) is still a placeholder.
export default function Home() {
  return (
    <main className="flex flex-col">
      <Showcase />
      <Skills />
      <Placeholder id="chat" label="AI Chat" />
      <Contact />
      <Footer />
    </main>
  );
}
