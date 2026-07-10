<!-- <h1 hidden align="center">Pocket</h1> -->

<p align="center">
  <img src="assets/banner.svg" alt="Pelican: A shell alias library that follows the shadcn approach" width="600" />
</p>

<p align="center">English | <a href="./README.zh_CN.md">中文</a></p>

> 🐦 The **pelican** is a bird skilled at catching fish. A trained pelican will deliver all its catch to its owner —
>
> and `Pelican` delivers every alias to you.
>
> Your command-line tool is right in your pelican' pouch — take it out.

A shell alias library that follows the shadcn approach — installed via copy source code, not dependency.

Feel free to customize it — you own the code, just like shadcn.

## Install — Adopt a free Pelican

```bash
# Use pnpx
pnpx @legend80s/pelican@latest catch # `@latest` is recommended

# Install globally
pnpm install -g @legend80s/pelican
pelican catch
```

## Alias List — The Catch

| Alias | Description | Usage |
| --- | --- | --- |
| `fish_open_npm` | Quickly open a package's npm page. | `fish_open_npm [pkg_name]` |
| `fish_pnpm_init_node_js_pkg` | Quickly set up a Node.js project with pnpm. | `fish_pnpm_init_node_js_pkg <folder_name>` |

## Usage — Go fishing

```bash
# Browse all aliases and find what interests you.
pelican list

# Choose interactively
pelican catch

# Install single alias
pelican catch <fish_name>

# Install multiple alias
pelican catch <fish_name1> <fish_name2> ...

# Show more usage
pelican --help
```

## Installation File Structure — The Pouch

```text
~/.pelican
└── alias-list           # This directory holds all installed aliases.
    ├── index.sh         # Entry point for installed alias functions.
    └── fish_open_npm.sh # Installed `fish_open_npm` alias. Feel free to customize it
```

It will insert `source` line below to your `~/.zshrc` or `~/.bashrc`：

```bash
# ~/.zshrc or ~/.bashrc
source ~/.pelican/aliases/index.sh
```

## Uninstall — Release Back to the Wild

Remove or comment the `source` line below then open a new terminal tab.

```bash
# ~/.zshrc or ~/.bashrc
# source ~/.pelican/aliases/index.sh
```

Feel free to remove `~/.pelican` directory (optional).
