import { defineCommand } from "../command.ts";
import { createLookup } from "../lookup.ts";

const platforms = createLookup({
  "3ds": { title: "3DS", body: "`/3ds/scratch-everywhere/` on your SD card" },
  nds: { title: "DS", body: "`/scratch-ds/` on your SD card", aliases: ["ds"] },
  wiiu: { title: "Wii U", body: "`/wiiu/scratch-wiiu/` on your SD card" },
  wii: { title: "Wii", body: "`/apps/scratch-wii/` on your SD card" },
  gamecube: {
    title: "GameCube",
    body: "`/scratch-gamecube/` on your SD card",
    aliases: ["gc"],
  },
  switch: {
    title: "Switch",
    body: "`/switch/scratch-nx/` on your SD card",
    aliases: ["nx"],
  },
  vita: { title: "Vita", body: "`ux0:data/scratch-vita/`" },
  psp: { title: "PSP", body: "`/scratch-psp/` on your memory stick" },
  ps4: { title: "PS4", body: "`/data/scratch-ps4/`" },
  xbox: { title: "Original Xbox", body: "`E:\\ScratchEverywhere\\`" },
  webos: { title: "webOS", body: "`projects/`" },
  windows: {
    title: "Windows",
    body:
      "`scratch-everywhere\\` next to the executable, if that folder exists. Otherwise `Documents\\scratch-everywhere\\`.",
  },
  linux: {
    title: "Linux",
    body:
      "If the executable is in a folder on your `PATH` (e.g. installed from the AUR): `$XDG_DATA_HOME/scratch-everywhere/`, which is `~/.local/share/scratch-everywhere/` by default.\nOtherwise: `scratch-everywhere/` next to the executable.",
  },
  macos: {
    title: "macOS",
    body: "`scratch-everywhere/` next to the executable",
    aliases: ["mac"],
  },
});

export default defineCommand({
  description: "Shows which folder to put projects in for a platform.",
  args: [{
    name: "platform",
    description: "Platform to look up",
    autocomplete: platforms.choices,
  }],
  run: ({ platform }) => {
    const { title, body } = platforms.resolve(platform);
    return {
      title: `${title} Projects Folder`,
      description:
        `Put your \`.sb3\` projects in:\n${body}\n\nIf you've turned on a custom projects path in the settings, that folder is used instead.`,
    };
  },
});
