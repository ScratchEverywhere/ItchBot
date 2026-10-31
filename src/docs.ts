import type { Choice } from "./command.ts";
import { UserError } from "./command.ts";
import { config } from "./config.ts";
import { github } from "./github.ts";
import { cached } from "./util/cache.ts";

interface DocEntry {
  /** URL path, e.g. `limitations` or `limitations#platform-specific`. */
  value: string;
  /** e.g. `Limitations` or `Limitations › Platform-Specific`. */
  title: string;
  section: boolean;
  /** First paragraph under the heading, flattened to plain text. */
  preview?: string;
}

const slugify = (heading: string) =>
  heading.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(
    /\s+/g,
    "-",
  );

const prettify = (path: string) =>
  (path.split("/").pop() ?? path).replace(/-/g, " ").replace(
    /^./,
    (c) => c.toUpperCase(),
  );

const PREVIEW_LENGTH = 350;

const toPreview = (paragraph: string[]): string | undefined => {
  const text = paragraph.join(" ")
    .replace(/<!--.*?-->/g, "")
    .replace(/::sb[^:]*::/g, "")
    .replace(/\[\^[^\]]*\]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  if (text.length <= PREVIEW_LENGTH) return text;
  return `${text.slice(0, PREVIEW_LENGTH).replace(/\s+\S*$/, "")}…`;
};

interface Heading {
  level: number;
  text: string;
  id?: string;
  paragraph: string[];
  closed: boolean;
}

const parsePage = (path: string, markdown: string): DocEntry[] => {
  const page = path.replace(/\.md$/, "");
  let lines = markdown.split("\n");
  if (lines[0] === "---") lines = lines.slice(lines.indexOf("---", 1) + 1);

  const headings: Heading[] = [];
  let current: Heading | undefined;
  let inFence = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inFence = !inFence;
      if (current?.paragraph.length) current.closed = true;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
    if (match) {
      const raw = match[2]!;
      current = {
        level: match[1]!.length,
        id: /\s*\{#([\w-]+)\}$/.exec(raw)?.[1],
        text: raw
          .replace(/\s*\{#[\w-]+\}$/, "")
          .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
          .replace(/[`*_]/g, ""),
        paragraph: [],
        closed: false,
      };
      headings.push(current);
      continue;
    }
    if (!current || current.closed) continue;

    const text = line.trim();
    if (!text || /^(#{4,}\s|>|:::|<|\||!\[)/.test(text)) {
      if (current.paragraph.length) current.closed = true;
      continue;
    }
    current.paragraph.push(text);
  }

  const h1 = headings.find((h) => h.level === 1);
  const pageTitle = h1?.text ?? prettify(page);
  return [
    {
      value: page,
      title: pageTitle,
      section: false,
      preview: h1 && toPreview(h1.paragraph),
    },
    ...headings.filter((h) => h.level > 1).map((h) => ({
      value: `${page}#${h.id ?? slugify(h.text)}`,
      title: `${pageTitle} › ${h.text}`,
      section: true,
      preview: toPreview(h.paragraph),
    })),
  ];
};

const loadDocs = cached(10 * 60_000, async () => {
  const tree = await github<{ tree: { path: string }[] }>(
    `git/trees/${config.docsBranch}?recursive=1`,
    config.docsRepo,
  );
  const paths = tree.tree
    .map((f) => f.path)
    .filter((p) =>
      p.endsWith(".md") && !p.startsWith(".") && p !== "README.md" &&
      p !== "index.md"
    )
    .sort();

  const pages = await Promise.all(paths.map(async (path) => {
    const res = await fetch(
      `https://raw.githubusercontent.com/${config.docsRepo}/${config.docsBranch}/${path}`,
    );
    if (!res.ok) throw new Error(`docs ${path} -> ${res.status}`);
    return parsePage(path, await res.text());
  }));
  return pages.flat();
});

/** Call on startup so the first autocomplete is instant. */
export const warmDocs = () =>
  loadDocs().catch((e) => console.warn("Couldn't preload docs:", e));

export const docsUrl = (value: string) => `${config.docsUrl}/${value}`;

export const searchDocs = async (query: string): Promise<Choice[]> => {
  const words = query.trim().toLowerCase().replace(/^\//, "").split(/\s+/)
    .filter(Boolean);
  const entries = await loadDocs();
  const matches = words.length
    ? entries.filter((e) =>
      words.every((w) => `${e.title} ${e.value}`.toLowerCase().includes(w))
    )
      .sort((a, b) => Number(a.section) - Number(b.section))
    : entries.filter((e) => !e.section);
  return matches.slice(0, 25).map((e) => ({
    name: e.title.slice(0, 100),
    value: e.value.slice(0, 100),
  }));
};

/** Accepts an autocompleted value (`limitations#features`), a bare page (`/limitations`) or a title. */
export const resolveDoc = async (input: string): Promise<DocEntry> => {
  const wanted = input.trim().toLowerCase().replace(/^\//, "").replace(
    /\.md$/,
    "",
  );
  const entries = await loadDocs();
  const entry = entries.find((e) => e.value.toLowerCase() === wanted) ??
    entries.find((e) => e.title.toLowerCase() === wanted);
  if (!entry) {
    throw new UserError(`I couldn't find a docs page called \`${input}\`.`);
  }
  return entry;
};
