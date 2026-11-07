const required = (name: string): string => {
  const value = Bun.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
};

export const config = {
  token: required("DISCORD_TOKEN"),
  guildId: Bun.env.DISCORD_GUILD_ID,
  updatesChannelId: Bun.env.UPDATES_CHANNEL_ID,
  /** Role pinged on each release announcement (optional). */
  updatesRoleId: Bun.env.UPDATES_ROLE_ID,
  githubToken: Bun.env.GITHUB_TOKEN,
  githubWebhookSecret: Bun.env.GITHUB_WEBHOOK_SECRET,
  port: Number(Bun.env.PORT ?? 3000),

  prefixes: ["!", "."],
  color: 0x754d75,
  githubRepo: "ScratchEverywhere/ScratchEverywhere",
  docsRepo: "ScratchEverywhere/ScratchEverywhere.github.io",
  /** The branch the docs site is deployed from. */
  docsBranch: "release",
  logoUrl: "https://github.com/ScratchEverywhere/ScratchEverywhere/blob/main/gfx/logo_se.png?raw=true",
  docsUrl: "https://scratcheverywhere.github.io",
  scratchboxUrl: "https://scratchbox.dev",
} as const;
