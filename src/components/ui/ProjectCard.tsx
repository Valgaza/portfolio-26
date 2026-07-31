import { type Project } from "@/data/me";

/**
 * Presentational card for a single project. No hooks, no data fetching — it
 * just renders a `Project`. This keeps it reusable: the Projects section maps
 * over `me.projects` with it now, and the AI chat's `getProjects` tool will
 * render the very same component later (step 6).
 */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex h-full flex-col gap-5 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-7 transition-colors duration-300 hover:border-accent/50 hover:bg-foreground/[0.04]">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-semibold tracking-tight">
          {project.title}
        </h3>
        <p className="text-sm text-accent">{project.tagline}</p>
      </div>

      <p className="text-sm leading-relaxed text-muted">
        {project.description}
      </p>

      <ul className="mt-auto flex flex-wrap gap-2 pt-2">
        {project.tech.map((t) => (
          <li
            key={t}
            className="rounded-full border border-foreground/10 px-3 py-1 font-mono text-xs text-muted"
          >
            {t}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-4 pt-1">
        {project.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-accent"
          >
            {link.label}
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
        ))}
      </div>
    </article>
  );
}
