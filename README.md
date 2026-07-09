<h1 align=center style="text-align: center;"> 🧰 Pocket</h1>

English | [中文](./README.zh_CN.md)

> Your command-line tool is right in your pocket — take it out.

A shell alias library that follows the shadcn approach — installed via copy source code, not dependency.

Feel free to customize it — you own the code, just like shadcn.

## Install

```bash
# Use pnpx
pnpx @legend80s/pocket@latest add # `@latest` is recommended

# Install globally
pnpm install -g @legend80s/pocket
pocket add
```

## Alias List

| Alias | Description | Usage |
| --- | --- | --- |
| `pocket_open_npm` | Quickly open a package's npm page. | `pocket_open_npm [pkg_name]` |
| `pocket_pnpm_init_node_js_pkg` | Quickly set up a Node.js project with pnpm. | `pocket_pnpm_init_node_js_pkg <folder_name>` |

## Usage

```bash
# Browse all aliases and find what interests you.
pocket list

# Choose interactively
pocket add

# Install single alias
pocket add <alias_name>

# Install multiple alias
pocket add <alias_name1> <alias_name2> ...

# Show more usage
pocket --help
```

## Installed Directory Layout

```text
~/.pocket
└── alias-list             # This directory holds all installed aliases.
    ├── index.sh           # Entry point for installed alias functions.
    └── pocket_open_npm.sh # Installed `pocket_open_npm` alias. Feel free to customize it
```

It will insert a one line `source` in your `~/.zshrc` or `~/.bashrc`：

```bash
# ~/.zshrc or ~/.bashrc
source ~/.pocket/aliases/index.sh
```

## Uninstall

Remove or comment the `source` line below then open a new terminal tab.

```bash
# ~/.zshrc or ~/.bashrc
# source ~/.pocket/aliases/index.sh
```

Feel free to remove `~/.pocket` directory (optional).
