import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";

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

// Single-page portfolio. Final order: Hero, About, Skills, Projects, AI Chat,
// Contact. Skills (step 5) still shows as a placeholder for now.
export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <About />
      <Placeholder id="skills" label="Skills" />
      <Projects />
      <Placeholder id="chat" label="AI Chat" />
      <Placeholder id="contact" label="Contact" />
    </main>
  );
}
