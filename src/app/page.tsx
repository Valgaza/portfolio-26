import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";

// Single-page portfolio. Each section becomes its own component under
// src/components/sections as we build it out (steps 2–6).
export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <About />

      {/* Placeholders — filled in over the next steps. */}
      {[
        ["skills", "Skills"],
        ["projects", "Projects"],
        ["chat", "AI Chat"],
        ["contact", "Contact"],
      ].map(([id, label]) => (
        <section
          key={id}
          id={id}
          className="flex min-h-screen items-center justify-center border-b border-white/10"
        >
          <h2 className="text-4xl font-semibold text-muted">{label}</h2>
        </section>
      ))}
    </main>
  );
}
