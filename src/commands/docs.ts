import { defineCommand } from "../command.ts";
import { config } from "../config.ts";
import { docsUrl, resolveDoc, searchDocs } from "../docs.ts";

export default defineCommand({
  description: "Links to a page (or section) of the documentation.",
  args: [{
    name: "page",
    description: "Docs page or section",
    autocomplete: searchDocs,
  }],
  run: async ({ page }) => {
    const doc = await resolveDoc(page);
    const url = docsUrl(doc.value);
    return {
      title: doc.title,
      url,
      description: [doc.preview, `[Read more in the docs](${url})`].filter(Boolean).join("\n\n"),
      thumbnail: config.logoUrl,
    };
  },
});
