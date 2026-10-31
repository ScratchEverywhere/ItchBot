import { defineCommand } from "../command.ts";
import { createLookup } from "../lookup.ts";

const rules = createLookup({
  "1": {
    title: "Be Respectful",
    body:
      "Treat everyone with respect. Absolutely no harassment, witch hunting, sexism, racism, or hate speech will be tolerated.",
    aliases: ["respect"],
  },
  "2": {
    title: "No NSFW Content",
    body:
      "No age-restricted or obscene content. This includes text, images, or links featuring nudity, sex, hard violence, or other graphically disturbing content.",
    aliases: ["nsfw"],
  },
  "3": {
    title: "No Spam or Advertising",
    body:
      "No spam or self-promotion (server invites, advertisements, etc) without permission from a staff member. This includes DMing fellow members without permission from them. Server Invites are allowed to redirect people to better places to get help for specific issues.",
    aliases: [
      "ad",
      "advertisement",
      "advertising",
      "promotion",
      "self-promotion",
    ],
  },
  "4": {
    title: "English Only",
    body:
      "Please keep conversations in this server English only. It's perfectly fine to use a translator like Google Translate, this just makes moderation easier.",
    aliases: ["language", "english", "english-only"],
  },
  "5": {
    title: "Don't be a Jerk",
    body:
      "Don't be a jerk. We work on this in our free time for free, so please be patient. If we ask you a question and you don't give us an answer, don't expect us to help you.",
    aliases: ["jerk"],
  },
  "6": {
    title: "Use Channels Appropriately",
    body:
      "Don't use #general if there's another channel meant specifically for your request or topic of conversation (e.g. ask for help in #support instead). This helps us and fellow members better keep track of different conversations happening at the same time and keeps chat history from getting cluttered.",
    aliases: ["channels", "channel"],
  },
});

export default defineCommand({
  description: "Says a specific rule.",
  args: [{
    name: "rule",
    description: "Rule number or name",
    autocomplete: rules.choices,
  }],
  run: ({ rule }) => {
    const { title, body } = rules.resolve(rule);
    return { title, description: body };
  },
});
