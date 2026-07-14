import assert from "node:assert"
import { execSync } from "node:child_process"
import { homedir } from "node:os"
import { describe, it } from "node:test"
import { stripVTControlCharacters } from "node:util"
import { listCommand } from "./list.js"

describe("#integration", () => {
  it("#should output Chinese when LANG=zh", async () => {
    const output = execSync(
      "node bin/pocket.js add fish_open_npm fish_pnpm_init_node_js_pkg --dry-run --force",
      {
        env: {
          ...process.env, // 保留原有环境变量
          LANG: "zh", // 添加或覆盖 LANG
          // TESTING: "true",
        },
      },
    ).toString("utf-8")

    // console.log("output:", output)
    const result = await listCommand({ printListResult: false })

    if (!result) {
      throw new Error("Command failed")
    }

    const { installed } = result
    const fish1 = installed["fish_open_npm"]
    const tip1 = fish1 ? `已更新` : `已安装`

    const fish2 = installed["fish_pnpm_init_node_js_pkg"]
    const tip2 = fish2 ? `已更新` : `已安装`

    assert.deepStrictEqual(
      stripVTControlCharacters(output).split("\n"),
      (
        `
> dry run mode ON, no action will be performed.


## 📦 安装结果

1. ✅ fish_open_npm: ${tip1} → 用法: fish_open_npm [--site=npmx] [包名]
2. ✅ fish_pnpm_init_node_js_pkg: ${tip2} → 用法: fish_pnpm_init_node_js_pkg [文件夹名]

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
