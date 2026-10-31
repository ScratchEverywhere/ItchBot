import { type Client, Events, MessageFlags } from "discord.js";
import { UserError } from "../command.ts";
import type { Registry } from "../registry.ts";
import { toMessage } from "./reply.ts";

export const registerInteractionHandler = (
  client: Client,
  registry: Registry,
) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isAutocomplete()) {
      const focused = interaction.options.getFocused(true);
      const arg = registry.get(interaction.commandName)?.args.find((a) =>
        a.name === focused.name
      );
      try {
        const choices =
          (await arg?.autocomplete?.(focused.value, { commands: registry })) ??
            [];
        await interaction.respond(choices.slice(0, 25));
      } catch (error) {
        console.error(
          `Autocomplete failed for /${interaction.commandName}:`,
          error,
        );
        await interaction.respond([]).catch(() => {});
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;
    const command = registry.get(interaction.commandName);
    if (!command) return;

    try {
      const args = Object.fromEntries(
        command.args.map((
          a,
        ) => [a.name, interaction.options.getString(a.name) ?? undefined]),
      );
      const reply = await command.run(args, { commands: registry });
      await interaction.reply(toMessage(reply));
    } catch (error) {
      let content =
        `There was an error while executing: \`${interaction.commandName}\``;
      if (error instanceof UserError) content = error.message;
      else console.error(`Error running /${interaction.commandName}:`, error);
      await interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(
        () => {},
      );
    }
  });
};
