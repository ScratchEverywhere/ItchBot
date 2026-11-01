import { createHmac, timingSafeEqual } from "node:crypto";
import { type Client, MessageFlags } from "discord.js";
import { config } from "./config.ts";
import { splitMessage } from "./util/chunk.ts";

interface ReleaseEvent {
  action: string;
  release: {
    tag_name: string;
    name: string | null;
    body: string | null;
    html_url: string;
    draft: boolean;
    prerelease: boolean;
  };
}

const validSignature = (body: string, header: string | null): boolean => {
  if (!header) return false;
  const expected = Buffer.from(
    `sha256=${
      createHmac("sha256", config.githubWebhookSecret!).update(body).digest(
        "hex",
      )
    }`,
  );
  const actual = Buffer.from(header);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

export const startReleaseWebhook = (client: Client) => {
  if (!config.updatesChannelId || !config.githubWebhookSecret) {
    console.warn(
      "UPDATES_CHANNEL_ID or GITHUB_WEBHOOK_SECRET not set; release announcements are disabled.",
    );
    return;
  }

  Bun.serve({
    port: config.port,
    routes: {
      "/github": {
        POST: async (req) => {
          const body = await req.text();
          if (!validSignature(body, req.headers.get("x-hub-signature-256"))) {
            return new Response("Invalid signature", { status: 401 });
          }

          if (req.headers.get("x-github-event") === "release") {
            const { action, release } = JSON.parse(body) as ReleaseEvent;
            if (
              action === "published" && !release.draft && !release.prerelease
            ) {
              await announce(client, release).catch((e) =>
                console.error("Couldn't announce release:", e)
              );
            }
          }
          return new Response("ok");
        },
      },
    },
    fetch: () => new Response("Not found", { status: 404 }),
  });
  console.log(`Listening for GitHub webhooks on :${config.port}/github`);
};

const announce = async (client: Client, release: ReleaseEvent["release"]) => {
  const channel = await client.channels.fetch(config.updatesChannelId!);
  if (!channel?.isSendable()) {
    throw new Error("UPDATES_CHANNEL_ID isn't a channel the bot can send to");
  }

  const { updatesRoleId } = config;
  const ping = updatesRoleId ? `<@&${updatesRoleId}>\n` : "";
  const header = `${ping}# ${
    release.name || release.tag_name
  }\n<${release.html_url}>\n\n`;
  const text = header + (release.body?.trim() || "No release notes.");

  for (const content of splitMessage(text)) {
    await channel.send({
      content,
      flags: MessageFlags.SuppressEmbeds,
      allowedMentions: {
        parse: [],
        roles: updatesRoleId ? [updatesRoleId] : [],
      },
    });
  }
};
