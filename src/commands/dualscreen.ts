import { join } from "node:path";
import { defineCommand } from "../command.ts";

export default defineCommand({
  description: "Explains dual screen support and shows the project template.",
  run: () => ({
    title: "Dual Screen",
    description: [
      "Setting the project resolution to **400x480** enables dual screen mode (template attached below): the top half is shown on the top screen (Wii U: TV) and the bottom half on the bottom screen (Wii U: GamePad).",
      "- **3DS:** 400x240 displays on the top screen only and 320x240 on the bottom screen only.",
      "- **Wii U:** always displays on both the TV and GamePad, whatever the resolution is.",
      "On a modded Scratch client like TurboWarp, change it in Advanced Settings and click `Store Settings In Project`.",
    ].join("\n"),
    image: "attachment://dualscreen.png",
    files: [join(import.meta.dir, "../../assets/dualscreen.png")],
  }),
});
