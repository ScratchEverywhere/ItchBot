export type Awaitable<T> = T | Promise<T>;

/** Thrown from a command to show a message to the user (instead of logging a crash). */
export class UserError extends Error {}

export interface Choice {
  name: string;
  value: string;
}

export interface Arg {
  name: string;
  description: string;
  /** Arguments are required unless this is set. Optional ones must come last. */
  optional?: boolean;
  /** Suggestions shown in slash mode. Return at most 25. */
  autocomplete?: (query: string, ctx: Context) => Awaitable<Choice[]>;
}

type ArgValues<A extends readonly Arg[]> = {
  [K in A[number] as K["name"]]: K extends { optional: true }
    ? string | undefined
    : string;
};

/**
 * What a command sends back: an embed, or plain text (e.g. so links unfurl themselves).
 * `files` are local paths to attach; an embed can show one with `image: "attachment://<file name>"`.
 */
export type Reply = (
  | { title: string; url?: string; description?: string; image?: string; thumbnail?: string }
  | { content: string }
) & { files?: string[] };

export interface Context {
  /** Every loaded command, keyed by name. */
  commands: ReadonlyMap<string, AnyCommand>;
}

export interface CommandDefinition<A extends readonly Arg[]> {
  description: string;
  /** Extra names for the command (both prefix and slash), e.g. `pull` for `pr`. */
  aliases?: readonly string[];
  args?: A;
  run(args: ArgValues<A>, ctx: Context): Awaitable<Reply>;
}

export interface AnyCommand {
  description: string;
  aliases: readonly string[];
  args: readonly Arg[];
  run(args: Record<string, string | undefined>, ctx: Context): Awaitable<Reply>;
}

export const defineCommand = <const A extends readonly Arg[]>(
  def: CommandDefinition<A>,
): AnyCommand => {
  return {
    description: def.description,
    aliases: def.aliases ?? [],
    args: def.args ?? [],
    run: def.run as AnyCommand["run"],
  };
};
