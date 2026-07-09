# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run tests (Node.js built-in test runner)
npm test

# Run a single test file
node --test src/utils/template.test.js

# Type check (tsgo wraps tsc with checkJs)
npm run typecheck

# Lint & format (biome)
pnpm biome check src/
pnpm biome format src/ --write
pnpm biome lint src/

# Run locally
node bin/pocket.js <command>
```

## Package Manager

pnpm. Lockfile is `pnpm-lock.yaml`.

## Architecture

A CLI tool (`@legend80s/pocket`) that installs curated shell alias functions from template files into `~/.pocket/aliases/index.sh` and auto-sources them from `.zshrc`/`.bashrc`.

### Entry Point

`bin/pocket.js` → `src/index.js` — parses args with Node.js built-in `node:util` `parseArgs`, dispatches to commands.

### Command Flow (`pocket add <alias>`)

1. `src/commands/add.js` — detects shell, reads config, resolves alias names (prompts via `prompts` if none given)
2. `src/utils/template.js` — loads `.sh` template from `templates/` directory
3. `src/commands/add.js` — writes alias function into `~/.pocket/aliases/index.sh` (surrounded by `# pocket:start`/`# pocket:end` markers)
4. `src/utils/config.js` — ensures `source '~/.pocket/aliases/index.sh'` line in `.zshrc`/`.bashrc`

### Key Modules

| Module | Role |
|--------|------|
| `src/index.js` | CLI entry, arg parsing, routing |
| `src/commands/add.js` | Install aliases: write to aliases file, update rc file |
| `src/commands/list.js` | List available + installed aliases with status |
| `src/utils/template.js` | Read templates from `templates/*.sh` |
| `src/utils/parser.js` | Parse/modify `aliases.sh` (find, replace, insert aliases) |
| `src/utils/config.js` | Shell detection, rc file path, pocket directory config |
| `src/utils/constants.js` | `uniqueHomeDir = "pocket"` |

### Templates

`templates/*.sh` — each file is one alias, with `# desc:` header line for description. Multi-file templates (e.g. `pnpm-init-node-js-pkg/`) organize additional resources alongside the `.sh` template.

### Adding a New Alias

1. Create `templates/<name>.sh` with a `# desc: <description>` header and a shell function
2. The function name should match the filename (e.g. `pocket_open_npm()` in `pocket_open_npm.sh`)
3. Tests in `src/utils/template.test.js` will need updating for the count assertion

### Type System

Pure JSDoc types in `.js` files, checked via `tsgo` (tsc with `checkJs: true`). Type definitions live in `src/types.ts`. No compilation step — source is run directly with Node.js ESM (`"type": "module"`).
