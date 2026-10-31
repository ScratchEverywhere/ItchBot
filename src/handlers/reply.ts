import { EmbedBuilder } from "discord.js";
import type { Reply } from "../command.ts";
import { config } from "../config.ts";

export const toMessage = (reply: Reply) => {
  const { files } = reply;
  if ("content" in reply) return { content: reply.content, files };
  return { embeds: [toEmbed(reply)], files };
};

const toEmbed = (reply: Exclude<Reply, { content: string }>): EmbedBuilder => {
  const embed = new EmbedBuilder().setColor(config.color).setTitle(reply.title);
  if (reply.url) embed.setURL(reply.url);
  if (reply.thumbnail) embed.setThumbnail(reply.thumbnail);
  if (reply.description) embed.setDescription(reply.description);
  if (reply.image) embed.setImage(reply.image);
  return embed;
};
