import { defineCommand } from "../command.ts";
import { githubItemArg, parseNumber, repoUrl } from "../github.ts";

export default defineCommand({
  description: "Mentions a GitHub issue.",
  args: [githubItemArg("issue")],
  run({ number }) {
    const n = parseNumber(number);
    return {
      content: `Please see Github Issue [#${n}](${repoUrl}/issues/${n})`,
    };
  },
});
