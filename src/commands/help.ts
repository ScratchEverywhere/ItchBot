import { type AnyCommand, defineCommand, UserError } from "../command.ts";
import { config } from "../config.ts";

const names = (
  commands: ReadonlyMap<string, AnyCommand>,
  command: AnyCommand,
) => [...commands].filter(([, c]) => c === command).map(([name]) => name);

const [prefix] = config.prefixes;

export default defineCommand({
  description: "Lists commands, or describes one.",
  args: [{
    name: "command",
    description: "Command to describe",
    optional: true,
    autocomplete: (query, { commands }) =>
      [...commands.keys()]
        .filter((name) => name.includes(query.trim().toLowerCase()))
        .map((name) => ({ name, value: name })),
  }],
  run({ command }, { commands }) {
    if (!command) {
      return {
        title: "Help",
        description: [...new Set(commands.values())].map((c) => {
          const [name, ...aliases] = names(commands, c);
          const also = aliases.length
            ? ` (also ${aliases.map((a) => `\`${a}\``).join(", ")})`
            : "";
          return `- \`${name}\`${also}: ${c.description}`;
        }).join("\n"),
      };
    }
    const name = command.toLowerCase().replace(/^[!.]/, "");
    const found = commands.get(name);
    if (!found) throw new UserError(`No command called \`${name}\`.`);
    const args = found.args.map((
      a,
    ) => (a.optional ? `[${a.name}]` : `<${a.name}>`));
    return {
      title: `${prefix}${name}`,
      description: `${found.description}\n\nUsage: \`${
        [prefix + name, ...args].join(" ")
      }\``,
    };
  },
});
