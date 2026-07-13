<!-- <h1 hidden align="center">Pelican</h1> -->

<p align="center">
  <img src="assets/banner.svg" alt="pelican: A shell alias library that follows the shadcn approach" width="660" />
</p>

<p align="center"><a href="./README.md">English</a> | 中文</p>

> 「**🐦 鹈鹕 tíhú**」是一种擅长捕鱼的鸟类，训练有素的鹈鹕会将所有鱼获交给主人。
>
> 从**鹈鹕**鼓鼓囊囊的喉囊中掏出你的专属命令行工具吧！

一个 shell alias 库。类似 shadcn，通过复制安装。

你可以尽情修改成自己想要的样子 — you own the code, just like shadcn.

## 安装 —— 领养专属鹈鹕

```md
# 使用 pnpx（推荐）
pnpx @legend80s/pelican@latest catch # 注意：`@latest` 建议增加

# 全局安装
pnpm install -g @legend80s/pelican
pelican catch
```

## Alias 库 —— 鱼获

| Fish (Alias) | 描述 | 如何食用 |
| --- | --- | --- |
| `fish_open_npm` | 快速打开 npm 包页 | `fish_open_npm [包名]` |
| `fish_open_repo` | 打开当前项目的远程仓库 URL，无论它是 GitHub、GitLab 还是私有部署的代码平台。 | `fish_open_repo` |
| `fish_pnpm_init_node_js_pkg` | 快速初始化 Node.js pnpm 项目 | `fish_pnpm_init_node_js_pkg [文件夹名]` |

## 使用方式 —— 捕鱼

> 以下命令均以 `tihu` 为例，你也可以使用 `pelican`，二者等价，详见 package.json [bin](./package.json#L16-L18)。

```md
# 查看所有 alias
tihu list

# 交互式选择
tihu catch

# 安装单个
tihu catch <fish_name>

# 批量安装
tihu catch <fish_name1> <fish_name2> ...

# 帮助
tihu --help
```

## 安装文件结构 —— 喉囊

```text
~/.pelican
└── alias-list           # 所有已安装的 alias 都会存放在这个目录下
    ├── index.sh         # 已安装 alias 函数入口文件
    └── fish_open_npm.sh # 已安装的 `fish_open_npm` alias 函数，你可随意修改成你想要的样子
```

Shell 配置文件自动添加：

```bash
# ~/.zshrc or ~/.bashrc
source ~/.pelican/aliases/index.sh
```

## 卸载 —— 丢弃鱼获

删除或注释如下 `source`，然后重启终端即可：

```bash
# ~/.zshrc or ~/.bashrc
# source ~/.pelican/aliases/index.sh
```

最后删除 `~/.pelican` 目录（可选）。

## 开发

```bash
# 本地运行
node bin/pocket.js <command>

# 强制切换语言测试
LANG=en node bin/pocket.js list    # 英文输出
LANG=zh node bin/pocket.js list    # 中文输出

# 运行测试
npm test

# 类型检查
npm run typecheck
```
