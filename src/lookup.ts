import { type Choice, UserError } from "./command.ts";

export interface LookupEntry {
  title: string;
  body: string;
  aliases?: string[];
}

export const createLookup = (entries: Record<string, LookupEntry>) => {
  const index = new Map<string, LookupEntry>();
  for (const [key, entry] of Object.entries(entries)) {
    for (const name of [key, ...(entry.aliases ?? [])]) {
      index.set(name.toLowerCase(), entry);
    }
  }

  return {
    resolve(input: string): LookupEntry {
      const entry = index.get(input.toLowerCase());
      if (!entry) {
        throw new UserError(
          `Unknown option \`${input}\`. Try one of: ${
            Object.keys(entries).map((k) => `\`${k}\``).join(", ")
          }`,
        );
      }
      return entry;
    },

    choices(query: string): Choice[] {
      const q = query.trim().toLowerCase();
      return Object.entries(entries)
        .filter(([key, e]) =>
          !q ||
          [key, e.title, ...(e.aliases ?? [])].some((s) =>
            s.toLowerCase().includes(q)
          )
        )
        .map(([key, e]) => ({
          name: `${key} (${e.title})`.slice(0, 100),
          value: key,
        }));
    },
  };
};
