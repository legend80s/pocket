import assert from "node:assert"
import { execSync } from "node:child_process"
import { homedir } from "node:os"
import { describe, it } from "node:test"
import { stripVTControlCharacters } from "node:util"

describe("#integration", () => {
  it("#should output Chinese when LANG=zh", async () => {
    const output = execSync(
      "node bin/pocket.js add fish_open_npm fish_pnpm_init_node_js_pkg --dry-run",
      {
        env: {
          ...process.env, // 保留原有环境变量
          LANG: "zh", // 添加或覆盖 LANG
        },
      },
    ).toString("utf-8")
    // console.log("output:", output)

    assert.deepStrictEqual(
      stripVTControlCharacters(output).split("\n"),
      (
        `
> dry run mode ON, no action will be performed.


## 📦 安装结果

1. ✅ fish_open_npm: 已安装 → 用法: fish_open_npm [--site=npmx] [包名]
2. ✅ fish_pnpm_init_node_js_pkg: 已安装 → 用法: fish_pnpm_init_node_js_pkg [文件夹名]

` +
        `✅ 已写入到 ~\\.pelican\\alias-list\\index.sh`.replace(
          "~",
          homedir(),
        ) +
        `

重启终端以生效
`
      ).split("\n"),
    )
  })
})
