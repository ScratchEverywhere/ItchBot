import { defineCommand, UserError } from "../command.ts";
import { github, repoUrl } from "../github.ts";
import { cached } from "../util/cache.ts";

const platforms = cached(10 * 60_000, async () => {
  const files = await github<{ name: string }[]>("contents/docs/controls");
  return files.filter((f) => f.name.endsWith(".png")).map((f) =>
    f.name.slice(0, -4)
  );
});

export default defineCommand({
  description: "Shows an image of the controls for each platform.",
  args: [{
    name: "platform",
    description: "Platform to show controls for",
    autocomplete: async (query) =>
      (await platforms())
        .filter((p) => p.includes(query.trim().toLowerCase()))
        .map((p) => ({ name: p, value: p })),
  }],
  run({ platform }) {
    if (!/^[\w-]+$/.test(platform)) {
      throw new UserError(`\`${platform}\` isn't a valid platform.`);
    }
    return {
      title: "Controls",
      image:
        `${repoUrl}/blob/main/docs/controls/${platform.toLowerCase()}.png?raw=true`,
    };
  },
});
