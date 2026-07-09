# Pocket

<p align="center">
  <img src="assets/banner.svg" alt="pocket: A shell alias library that follows the shadcn approach" width="600" />
</p>

[English](./README.md) | 中文

> 从口袋里掏出你的专属命令行工具。

一个 shell alias 库。类似 shadcn，通过复制安装。

你可以尽情修改成自己想要的样子 — you own the code, just like shadcn.

## 安装

```bash
# 使用 pnpx（推荐）
pnpx @legend80s/pocket@latest add # 注意：`@latest` 建议增加

# 全局安装
pnpm install -g @legend80s/pocket
pocket add
```

## Alias 库

| Alias | 描述 | 用法 |
| --- | --- | --- |
| `pocket_open_npm` | 快速打开 npm 包页 | `pocket_open_npm [包名]` |
| `pocket_pnpm_init_node_js_pkg` | 快速初始化 Node.js pnpm 项目 | `pocket_pnpm_init_node_js_pkg [文件夹名]` |

## 使用

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

## 安装文件结构

```text
~/.pocket
└── alias-list             # 所有已安装的 alias 都会存放在这个目录下
    ├── index.sh           # 已安装 alias 函数入口文件
    └── pocket_open_npm.sh # 已安装的 `pocket_open_npm` alias 函数，你可随意修改成你想要的样子
```

Shell 配置文件自动添加：

```bash
# ~/.zshrc or ~/.bashrc
source ~/.pocket/aliases/index.sh
```

## 卸载

删除或注释如下 `source`，然后重启终端即可：

```bash
# ~/.zshrc or ~/.bashrc
# source ~/.pocket/aliases/index.sh
```

最后删除 `~/.pocket` 目录（可选）。
