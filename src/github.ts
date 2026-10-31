import type { Arg, Choice } from "./command.ts";
import { UserError } from "./command.ts";
import { config } from "./config.ts";
import { cached } from "./util/cache.ts";

export const repoUrl = `https://github.com/${config.githubRepo}`;

export const github = async <T>(path: string, repo: string = config.githubRepo): Promise<T> => {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/${path}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "itchbot",
        ...(config.githubToken &&
          { Authorization: `Bearer ${config.githubToken}` }),
      },
    },
  );
  if (!res.ok) throw new Error(`GitHub ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
};

type Kind = "issue" | "pr";

interface Item {
  number: number;
  title: string;
  kind: Kind;
  state: "open" | "closed" | "merged";
}

interface ApiIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  pull_request?: { merged_at: string | null };
}

const MAX_PAGES = 5;

const loadItems = cached(5 * 60_000, async () => {
  const items: Item[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await github<ApiIssue[]>(
      `issues?state=all&per_page=100&page=${page}`,
    );
    for (const i of batch) {
      items.push({
        number: i.number,
        title: i.title,
        kind: i.pull_request ? "pr" : "issue",
        state: i.pull_request?.merged_at ? "merged" : i.state,
      });
    }
    if (batch.length < 100) break;
  }
  return items;
});

/** Call on startup so the first autocomplete is instant. */
export const warmItems = () =>
  loadItems().catch((e) => console.warn("Couldn't preload GitHub items:", e));

const searchItems = async (kind: Kind, query: string): Promise<Choice[]> => {
  const q = query.trim().replace(/^#/, "").toLowerCase();
  const items = (await loadItems()).filter((i) => i.kind === kind);
  const matches = q
    ? items.filter((i) =>
      String(i.number).startsWith(q) || i.title.toLowerCase().includes(q)
    )
    : items;
  return matches.slice(0, 25).map((i) => ({
    name: `#${i.number} ${i.title} (${i.state})`.slice(0, 100),
    value: String(i.number),
  }));
};

/** An argument that autocompletes issue or pull request numbers. */
export const githubItemArg = (kind: Kind): Arg & { name: "number" } => {
  return {
    name: "number",
    description: kind === "pr"
      ? "Pull request number or title"
      : "Issue number or title",
    autocomplete: (query) => searchItems(kind, query),
  };
};

/** Accepts `123` or `#123`. */
export const parseNumber = (input: string): number => {
  const match = /^#?(\d{1,7})$/.exec(input.trim());
  if (!match) throw new UserError(`\`${input}\` isn't a valid number.`);
  return Number(match[1]);
};
