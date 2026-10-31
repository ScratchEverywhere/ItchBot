import { defineCommand } from "../command.ts";
import { githubItemArg, parseNumber, repoUrl } from "../github.ts";

export default defineCommand({
  aliases: ["pull"],
  description: "Links to a Github Pull Request.",
  args: [githubItemArg("pr")],
  run({ number }) {
    const n = parseNumber(number);
    return {
      content: `Please see Github Pull Request [#${n}](${repoUrl}/pull/${n})`,
    };
  },
});
