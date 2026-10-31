import { defineCommand } from "../command.ts";
import { config } from "../config.ts";
import { createLookup } from "../lookup.ts";

const base = `https://nightly.link/${config.githubRepo}/workflows`;
const branch = "main";

const build = (workflow: string, platform: string, artifact: string) => ({
  title: `${platform} Nightly Build`,
  body:
    `[Download the latest ${platform} nightly](${base}/nightly-${workflow}/${branch}/${
      encodeURIComponent(artifact)
    }.zip)`,
});

const platforms = createLookup({
  "3ds": build("3ds", "3DS", "Scratch Everywhere! 3DS Nightly"),
  nds: {
    ...build("nds", "DS", "Scratch Everywhere! DS Nightly"),
    aliases: ["ds"],
  },
  wiiu: build("wiiu", "Wii U", "Scratch Everywhere! Wii U Nightly"),
  wii: build("wii", "Wii", "Scratch Everywhere! Wii Nightly"),
  gamecube: {
    ...build("gamecube", "GameCube", "Scratch Everywhere! GameCube Nightly"),
    aliases: ["gc"],
  },
  switch: {
    ...build("switch", "Switch", "Scratch Everywhere! Switch Nightly"),
    aliases: ["nx"],
  },
  vita: build("vita", "Vita", "Scratch Everywhere! Vita Nightly"),
  psp: build("psp", "PSP", "Scratch Everywhere! PSP Nightly"),
  ps4: build("ps4", "PS4", "Scratch Everywhere! PS4 Nightly"),
  xbox: build(
    "xbox",
    "Original Xbox",
    "Scratch Everywhere! Original Xbox Nightly",
  ),
  webos: build("webos", "webOS", "Scratch Everywhere! webOS Nightly"),
  libretro: {
    ...build("libretro", "Libretro", "Scratch Everywhere! Libretro Nightly"),
    aliases: ["retroarch"],
  },
  pc: {
    title: "PC Nightly Builds",
    body:
      `[Pick a PC build (Linux/Windows, per renderer)](${base}/nightly-pc/${branch})`,
    aliases: ["windows", "linux"],
  },
});

export default defineCommand({
  description: "Links to the latest nightly build for a platform.",
  args: [{
    name: "platform",
    description: "Platform to download",
    autocomplete: platforms.choices,
  }],
  run: ({ platform }) => {
    const { title, body } = platforms.resolve(platform);
    return {
      title,
      description:
        `${body}\n\nNightly builds come straight from \`${branch}\` and may be unstable.`,
    };
  },
});
