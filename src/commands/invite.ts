import { defineCommand } from "../command.ts";
import { createLookup } from "../lookup.ts";

const servers = createLookup({
  nintendo: { title: "Nintendo Homebrew", body: "https://discord.gg/C29hYvh" },
  vita: { title: "Vita Nuova", body: "https://discord.gg/Mz7MmktcuK" },
  wiiu: { title: "Aroma", body: "https://discord.com/invite/bZ2rep2" },
  "4tu": {
    title: "For The Users",
    body: "https://discord.gg/z8wBTvU",
    aliases: ["fortheusers"],
  },
  nitrobolt: {
    title: "Nitrobolt",
    body: "https://discord.gg/gaxd7kcvry",
    aliases: ["nb"],
  },
  warpdrive: {
    title: "Warpdrive",
    body: "https://discord.gg/vhqZxWpuP4",
    aliases: ["wd"],
  },
  penguinmod: {
    title: "PenguinMod",
    body: "https://discord.gg/NZ9MBMYTZh",
    aliases: ["pm"],
  },
  turbowarp: {
    title: "TurboWarp",
    body: "https://discord.gg/K5zj3FvMNE",
    aliases: ["tw"],
  },
  scratch: {
    title: "Scratch Community",
    body: "https://discord.gg/EMvhHE7F6J",
  },
  pretendo: {
    title: "Pretendo Network",
    body: "https://discord.gg/pretendo",
  },
  universal: {
    title: "Universal Team",
    body: "https://universal-team.net/discord",
    aliases: ["uni", "unidb"],
  },
  osc: {
    title: "Open Shop Channel",
    body: "https://discord.gg/by6mR5N",
  },
  odysea: {
    title: "odysea",
    body: "https://discord.gg/VypcXZQyjp",
  },
});

export default defineCommand({
  description: "Invites to some discord servers.",
  args: [{
    name: "server",
    description: "Server to invite to",
    autocomplete: servers.choices,
  }],
  run: ({ server }) => {
    return { content: servers.resolve(server).body };
  },
});
