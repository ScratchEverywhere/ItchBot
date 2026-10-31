import { defineCommand } from "../command.ts";
import { repoUrl } from "../github.ts";

export default defineCommand({
  description: "Links to our tracking issue on platform support.",
  run: () => ({
    title: "Platform Support",
    description:
      `Please see [#166](${repoUrl}/issues/166) on GitHub for anything related to porting to other platforms.`,
  }),
});
