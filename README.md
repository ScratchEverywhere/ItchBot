# itchbot

Discord bot for the Scratch Everywhere! server.

## Running

```sh
cp .env.example .env   # fill it in
bun install
bun start
```

## Adding a command

Create `src/commands/<name>.ts`. It's registered automatically as both
`.<name>`, `!<name>`, and `/<name>`. Files starting with `_` are ignored.

```ts
import { defineCommand } from "../command.ts";

export default defineCommand({
  description: "Says hi.",
  args: [{ name: "who", description: "Who to greet", optional: true }], // optional
  run: ({ who }) => ({ title: "Hi", description: `Hello ${who ?? "world"}!` }),
});
```

- Add `autocomplete: (query, ctx) => [{ name, value }]` to an arg for
  slash-command suggestions.
- Throw `UserError` for a friendly message instead of a logged crash.
- For "pick one of these" commands, use `createLookup` (`src/lookup.ts`); see
  `rule.ts`.
