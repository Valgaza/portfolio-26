import { me } from "@/data/me";

/**
 * The grounding for the portfolio chatbot.
 *
 * PRIVACY: this is built ONLY from `me.ts` — the same professional information
 * already shown on the page (bio, experience, projects, skills, email). It must
 * NOT include the raw CV, phone number, or any private contact detail. If you
 * add private fields to `me.ts` later, do not surface them here.
 */
function buildKnowledge(): string {
  const experiences = me.experiences
    .map(
      (e) =>
        `- ${e.org} — ${e.title} (${e.period})${
          e.location ? `, ${e.location}` : ""
        }: ${e.description}`,
    )
    .join("\n");

  const projects = me.projects
    .map(
      (p) =>
        `- ${p.title} [${p.category}${
          p.status && p.status !== "live" ? `, ${p.status}` : ""
        }]: ${p.description} (tech: ${p.tech.join(", ")})`,
    )
    .join("\n");

  const skills = me.skills
    .map((g) => `- ${g.category}: ${g.items.join(", ")}`)
    .join("\n");

  return `# About ${me.name}
${me.role}. ${me.degree}, ${me.college} (class of ${me.gradYear}). Based in ${me.location}.

${me.bio}

## Experience & education
${experiences}

## Projects
${projects}

## Skills
${skills}

## Highlights
${me.funFacts.map((f) => `- ${f}`).join("\n")}

## Contact
Email: ${me.email}
${me.socials.map((s) => `${s.label}: ${s.href}`).join("\n")}`;
}

export const SYSTEM_PROMPT = `You are the portfolio assistant for ${me.name}. You answer questions from recruiters, collaborators, and visitors about ${me.name}'s work, experience, skills, and projects.

Rules:
- Answer ONLY from the knowledge below. If something isn't covered, say you don't have that detail and point them to the email or LinkedIn.
- Be concise and conversational — a few sentences, not essays. Speak about ${me.name} in the third person ("Aarya built…", "he worked at…").
- Never invent employers, dates, metrics, or projects. Don't share any contact detail beyond the email and social links listed.
- If asked something off-topic (not about ${me.name}), briefly redirect to what you can help with.

--- KNOWLEDGE ---
${buildKnowledge()}`;
