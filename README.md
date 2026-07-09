# 🧰 pocket

从口袋里掏出你的专属命令行工具。

## 安装

```bash
# 使用 npx（推荐）
npx @legend80s/pocket@latest add opennpm # 注意：`@latest` 建议增加

# 全局安装
npm install -g @legend80s/pocket
pocket add opennpm
```

## Alias 库

| Alias | 描述 |
| :---: | :---: |
| opennpm | 快速打开 npm 包页 |

## 使用

```bash
# 安装 alias
pocket add opennpm

# 批量安装
pocket add opennpm opengh

# 交互式选择
pocket add

# 强制覆盖
pocket add opennpm --force

# 查看已安装
pocket list

# 帮助
pocket --help
```

## 文件结构

```text
~/.pocket/
└── aliases          # 所有已安装的 alias 函数
    └── index.sh
    └── pocket_open_npm.sh
```

.zshrc 中自动添加：

```bash
source ~/.pocket/aliases/index.sh
```
