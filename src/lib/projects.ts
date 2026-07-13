import fs from "node:fs";
import path from "node:path";
import { me, type Project } from "@/data/me";

/**
 * Folder-driven projects.
 *
 * Drop one `.json` file per project into `content/projects/`. This runs on the
 * SERVER at build/request time (it uses `fs`), so `page.tsx` calls it and passes
 * the result down to the client `<Showcase />` — no code edits needed to add a
 * project, just a new file.
 *
 * ORDER: files are sorted by filename, so prefix them to control the sequence:
 *   content/projects/01-modevelle.json
 *   content/projects/02-the-shear-room.json
 *   ...
 *
 * IMAGES: put the image in `public/projects/` and reference it from the JSON as
 *   "image": "/projects/modevelle.jpg"
 *
 * Each JSON matches the `Project` shape from `src/data/me.ts`:
 *   { "slug", "title", "tagline", "category", "description", "tech": [],
 *     "status": "live" | "in-progress", "links": [{ "label", "href" }],
 *     "image"?: "/projects/…" }
 *
 * If the folder is missing or empty, we fall back to the seed list in `me.ts`
 * (which also keeps the AI-chat knowledge base working).
 */
const DIR = path.join(process.cwd(), "content/projects");

export function getProjects(): Project[] {
  let files: string[];
  try {
    files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return me.projects; // folder doesn't exist yet
  }
  if (files.length === 0) return me.projects;

  return files
    .sort()
    .map(
      (f) =>
        JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Project,
    );
}
