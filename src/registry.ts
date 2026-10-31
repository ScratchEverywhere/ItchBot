import { Glob } from "bun";
import {
  ApplicationCommandOptionType,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { join } from "node:path";
import type { AnyCommand } from "./command.ts";

const commandsDir = join(import.meta.dir, "commands");
const NAME = /^[a-z0-9_-]{1,32}$/;

export type Registry = Map<string, AnyCommand>;

export const loadCommands = async (): Promise<Registry> => {
  const registry: Registry = new Map();

  for (const file of new Glob("[!_]*.ts").scanSync(commandsDir)) {
    const name = file.slice(0, -3);
    const command = (await import(join(commandsDir, file))).default as
      | AnyCommand
      | undefined;
    if (!command) {
      throw new Error(
        `commands/${file} has no default export (use defineCommand)`,
      );
    }
    validate(name, command);
    for (const key of [name, ...command.aliases]) {
      if (registry.has(key)) {
        throw new Error(
          `commands/${file}: "${key}" is already used by another command`,
        );
      }
      registry.set(key, command);
    }
  }

  return registry;
};

const validate = (name: string, command: AnyCommand) => {
  const fail = (why: string) => {
    throw new Error(`commands/${name}.ts: ${why}`);
  };
  if (!NAME.test(name)) {
    fail("file name must be lowercase letters, digits, '-' or '_' (max 32)");
  }
  for (const alias of command.aliases) {
    if (!NAME.test(alias)) {
      fail(
        `alias "${alias}" must be lowercase letters, digits, '-' or '_' (max 32)`,
      );
    }
  }
  if (!command.description || command.description.length > 100) {
    fail("description must be 1-100 characters");
  }
  if (command.args.length > 25) fail("at most 25 args");

  let sawOptional = false;
  for (const arg of command.args) {
    if (!NAME.test(arg.name)) {
      fail(
        `arg name "${arg.name}" must be lowercase letters, digits, '-' or '_'`,
      );
    }
    if (!arg.description || arg.description.length > 100) {
      fail(`arg "${arg.name}" description must be 1-100 characters`);
    }
    if (sawOptional && !arg.optional) {
      fail("required args can't follow optional ones");
    }
    sawOptional ||= !!arg.optional;
  }
};

export const toSlashPayloads = (
  registry: Registry,
): RESTPostAPIChatInputApplicationCommandsJSONBody[] => {
  return [...registry].map(([name, command]) => ({
    name,
    description: command.description,
    options: command.args.map((arg) => ({
      type: ApplicationCommandOptionType.String,
      name: arg.name,
      description: arg.description,
      required: !arg.optional,
      autocomplete: !!arg.autocomplete,
    })),
  }));
};
