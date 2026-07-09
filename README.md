# 🧰 Pocket

> Your command-line tool is right in your pocket — take it out.

A shell alias library that follows the shadcn approach — installed via copy source code, not dependency.

Feel free to customize it — you own the code, just like shadcn.

## Install

```bash
# Use npx
npx @legend80s/pocket@latest add # `@latest` is recommended

# Install globally
npm install -g @legend80s/pocket
pocket add opennpm
```

## Alias List

| Alias | 描述 |
| :---: | :---: |
| opennpm | 快速打开 npm 包页 |

## Usage

```bash
# 查看所有 alias
pocket list

# 交互式选择
pocket add

# 安装单个
pocket add opennpm

# 批量安装
pocket add opennpm opengh

# 帮助
pocket --help
```

## Installed Directory Layout

```text
.pocket
└── alias-list             # 所有已安装的 alias 都会存放在这个目录下
    ├── index.sh           # 已安装 alias 函数入口文件
    └── pocket_open_npm.sh # 目前安装的 `pocket_open_npm` alias 函数
```

It will insert a one line `source` in your `~/.zshrc` or `~/.bashrc`：

```bash
# ~/.zshrc or ~/.bashrc
source ~/.pocket/aliases/index.sh
```

## Uninstall

Remove or comment the `source` then open a new terminal tab.

```bash
# ~/.zshrc or ~/.bashrc
# source ~/.pocket/aliases/index.sh
```
