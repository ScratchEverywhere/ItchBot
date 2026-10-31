import { type Client, Events } from "discord.js";
import { type AnyCommand, UserError } from "../command.ts";
import { config } from "../config.ts";
import type { Registry } from "../registry.ts";
import { toMessage } from "./reply.ts";

const usage = (prefix: string, name: string, command: AnyCommand) => {
  const args = command.args.map((
    a,
  ) => (a.optional ? `[${a.name}]` : `<${a.name}>`));
  return `Usage: \`${[prefix + name, ...args].join(" ")}\``;
};

export const registerMessageHandler = (client: Client, registry: Registry) => {
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    const prefix = config.prefixes.find((p) => message.content.startsWith(p));
    if (!prefix) return;

    const [name, ...tokens] = message.content.slice(prefix.length).trim().split(
      /\s+/,
    );
    const command = registry.get(name?.toLowerCase() ?? "");
    if (!command || !message.channel.isSendable()) return;

    const required = command.args.filter((a) => !a.optional).length;
    if (tokens.length < required || tokens.length > command.args.length) {
      await message.reply(usage(prefix, name!.toLowerCase(), command));
      return;
    }

    try {
      const args = Object.fromEntries(
        command.args.map((a, i) => [a.name, tokens[i]]),
      );
      const reply = await command.run(args, { commands: registry });
      await message.channel.send({
        ...toMessage(reply),
        reply: message.reference?.messageId
          ? {
            messageReference: message.reference.messageId,
            failIfNotExists: false,
          }
          : undefined,
      });
    } catch (error) {
      if (error instanceof UserError) {
        await message.reply(error.message);
        return;
      }
      console.error(`Error running ${prefix}${name}:`, error);
      await message.reply(`There was an error while executing: \`${name}\``);
    }
  });
};
