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

A CLI tool (`@legend80s/pocket`) that installs curated shell alias functions from template files into `~/.pocket/alias-list/` and auto-sources them from `.zshrc`/`.bashrc`.

### Deployment Layout

After `pocket add`, the user's `~/.pocket/` looks like:

```
~/.pocket/
└── alias-list/
    ├── pocket_open_npm.sh          ← single-file template
    ├── pnpm_init_node_js_pkg/      ← multi-file template (entire directory copied)
    │   ├── index.sh                ← entry point, has # desc:
    │   └── modify.js
    └── index.sh                    ← auto-managed: source ./pocket_open_npm.sh
                                         source ./pnpm_init_node_js_pkg/index.sh
```

The rc file (`~/.zshrc`/`~/.bashrc`) has one line: `source ~/.pocket/alias-list/index.sh`.

### Entry Point

`bin/pocket.js` → `src/index.js` — parses args with Node.js built-in `node:util` `parseArgs`, dispatches to commands.

### Command Flow (`pocket add <alias>`)

1. `src/commands/add.js` — detects shell, reads config, resolves alias names (prompts via `prompts` if none given)
2. `src/utils/template.js` — loads template info from `templates/` (`.sh` file = single-file, directory with `index.sh` = multi-file)
3. `src/commands/add.js` — copies template content to `~/.pocket/alias-list/`, appends source line to `index.sh`
4. On overwrite: deletes old target, copies new, shows simple line diff (±, up to 3 lines)
5. `src/utils/config.js` — ensures `source '~/.pocket/alias-list/index.sh'` line in rc file

### Template Types

| Type | Layout | Template Name |
|------|--------|---------------|
| Single-file | `templates/foo.sh` | `foo` (filename without `.sh`) |
| Multi-file | `templates/bar/index.sh` + support files | `bar` (directory name) |

Each template must have a `# desc: <description>` line in the `.sh` file.

### Key Modules

| Module | Role |
|--------|------|
| `src/index.js` | CLI entry, arg parsing, routing |
| `src/commands/add.js` | Install aliases: copy file/dir to alias-list, manage index.sh, show diff |
| `src/commands/list.js` | List available + installed aliases with status (installed = file/dir exists under alias-list) |
| `src/utils/template.js` | Scan `templates/` for single-file and multi-file templates, load by name |
| `src/utils/config.js` | Shell detection, rc file path, pocket/alias-list directory config |
| `src/utils/constants.js` | `uniqueHomeDir = "pocket"` |
| `src/utils/diff.js` | Simple line-level diff (no external deps) |

### Type System

Pure JSDoc types in `.js` files, checked via `tsgo` (tsc with `checkJs: true`). Type definitions live in `src/types.ts`. No compilation step — source is run directly with Node.js ESM (`"type": "module"`).
