import { defineCommand } from "../command.ts";
import { projectChoices, projectUrl, resolveProjectId } from "../scratchbox.ts";

export default defineCommand({
  aliases: ["sb", "project"],
  description: "Links to a project on ScratchBox.",
  args: [{
    name: "project",
    description: "Project name, ID or link",
    autocomplete: projectChoices,
  }],
  run: async ({ project }) => ({
    content: projectUrl(await resolveProjectId(project)),
  }),
});
