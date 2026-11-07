import type { Choice } from "./command.ts";
import { UserError } from "./command.ts";
import { config } from "./config.ts";
import { cached } from "./util/cache.ts";

export interface ScratchBoxProject {
  id: string;
  name: string;
  description: string;
}

const PROJECT_ID = /^[A-Za-z0-9]{12}$/;

export const projectUrl = (id: string) =>
  `${config.scratchboxUrl}/project/${id}`;

const TIMEOUT_MS = 2500;

const api = async <T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T | undefined> => {
  const url = new URL(`${config.scratchboxUrl}/api/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "itchbot" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`ScratchBox ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
};

const MAX_PAGES = 5;

const loadRecent = cached(5 * 60_000, async () => {
  const projects: ScratchBoxProject[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await api<ScratchBoxProject[]>("projects", {
      sort: "newest",
      ps: "100",
      p: String(page),
    }) ?? [];
    projects.push(...batch);
    if (batch.length < 100) break;
  }
  return projects;
});

export const warmScratchBox = () =>
  loadRecent().catch((e) => console.warn("Couldn't preload ScratchBox:", e));

const searchProjects = async (query: string): Promise<ScratchBoxProject[]> => {
  const q = query.trim();
  const recent = await loadRecent().catch(() => []);
  if (!q) return recent;

  const lower = q.toLowerCase();
  const local = recent.filter((p) => p.name.toLowerCase().includes(lower));
  const remote = await api<ScratchBoxProject[]>("search", { q, ps: "25" })
    .catch(() => undefined) ?? [];

  const seen = new Set<string>();
  return [...remote, ...local].filter((p) =>
    seen.has(p.id) ? false : (seen.add(p.id), true)
  );
};

export const projectChoices = async (query: string): Promise<Choice[]> =>
  (await searchProjects(query)).slice(0, 25).map((p) => ({
    name: p.name.slice(0, 100) || p.id,
    value: p.id,
  }));

const idFromLink = (input: string): string | undefined => {
  try {
    const url = new URL(input);
    if (url.hostname !== new URL(config.scratchboxUrl).hostname) return;
    return /^\/project\/([^/]+)/.exec(url.pathname)?.[1];
  } catch {
    return undefined;
  }
};

export const resolveProjectId = async (input: string): Promise<string> => {
  const text = input.trim();
  const id = idFromLink(text) ?? (PROJECT_ID.test(text) ? text : undefined);
  if (id) return id;

  const [match] = await api<ScratchBoxProject[]>("search", { q: text, ps: "1" })
    .catch(() => {
      throw new UserError("ScratchBox didn't respond, try again in a moment.");
    }) ?? [];
  if (!match) {
    throw new UserError(
      `I couldn't find a ScratchBox project called \`${text}\`.`,
    );
  }
  return match.id;
};
