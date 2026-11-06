import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "./config.ts";
import { warmDocs } from "./docs.ts";
import { warmItems } from "./github.ts";
import { registerInteractionHandler } from "./handlers/interaction.ts";
import { registerMessageHandler } from "./handlers/message.ts";
import { loadCommands, toSlashPayloads } from "./registry.ts";
import { startReleaseWebhook } from "./releases.ts";

const registry = await loadCommands();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  // Never ping anyone from bot output; user input can end up in replies.
  allowedMentions: { parse: [], repliedUser: false },
});

registerMessageHandler(client, registry);
registerInteractionHandler(client, registry);

client.once(Events.ClientReady, async (ready) => {
  const payloads = toSlashPayloads(registry);
  if (config.guildId) {
    await ready.guilds.cache.get(config.guildId)?.commands.set(payloads);
  } else {
    await ready.application.commands.set(payloads);
  }
  void warmItems();
  void warmDocs();
  startReleaseWebhook(ready);
  console.log(
    `Online as ${ready.user.tag} with ${registry.size} commands: ${
      [...registry.keys()].join(", ")
    }`,
  );
});

await client.login(config.token);
