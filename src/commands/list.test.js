import assert from "node:assert"
import { execSync } from "node:child_process"
import { homedir } from "node:os"
import { after, describe, it, mock } from "node:test"
import { stripVTControlCharacters } from "node:util"

const ORIG_LANG = process.env.LANG

describe("list command integration (i18n) #integration", () => {
  /** @type {string[]} */
  let outputChunks = []

  after(() => {
    process.env.LANG = ORIG_LANG
    mock.reset()
  })

  /**
   * Run listCommand with a given LANG and return captured stdout
   * @param {string} lang
   * @returns {Promise<string>}
   */
  async function captureOutput(lang) {
    process.env.LANG = lang
    outputChunks = []

    const origWrite = process.stdout.write.bind(process.stdout)
    process.stdout.write = (
      /** @type {string | Uint8Array} */ chunk,
      ...rest
    ) => {
      if (typeof chunk === "string") {
        outputChunks.push(chunk)
      }
      return true
    }

    try {
      // Dynamic import to get fresh module instance
      const { listCommand } = await import("./list.js")
      await listCommand()
    } finally {
      process.stdout.write = origWrite
    }

    return outputChunks.join("")
  }

  it("#integration should output Chinese when LANG=zh", async () => {
    const output = execSync("node ./bin/pocket.js list", {
      env: {
        ...process.env, // 保留原有环境变量
        LANG: "zh", // 添加或覆盖 LANG
      },
    }).toString("utf-8")
    // console.log("output:", output)

    assert.deepStrictEqual(
      stripVTControlCharacters(output).split("\n"),
      (
        `
┌─────────┬──────────────────────────────┬────────────────────────────────┬─────────────────────────────────────────┬─────────────┐
│ (index) │ Fish (alias)                 │ Description                    │ Usage                                   │ Status      │
├─────────┼──────────────────────────────┼────────────────────────────────┼─────────────────────────────────────────┼─────────────┤
│ 1       │ 'fish_open_npm'              │ '快速打开 npm 包页'            │ 'fish_open_npm [--site=npmx] [包名]'    │ '⬜ 未安装' │
│ 2       │ 'fish_pnpm_init_node_js_pkg' │ '快速初始化 Node.js pnpm 项目' │ 'fish_pnpm_init_node_js_pkg [文件夹名]' │ '⬜ 未安装' │
└─────────┴──────────────────────────────┴────────────────────────────────┴─────────────────────────────────────────┴─────────────┘

` +
        `📁 安装路径: ~\\.pelican\\alias-list\\index.sh`.replace(
          "~",
          homedir(),
        ) +
        `

💡 运行 \`pelican catch <fish>\` 安装
`
      ).split("\n"),
    )
  })

  it("#integration should output English when LANG=en", async () => {
    const output = execSync("node ./bin/pocket.js list", {
      env: {
        ...process.env, // 保留原有环境变量
        LANG: "en", // 添加或覆盖 LANG
      },
    }).toString("utf-8")
    // console.log("output:", output)

    assert.deepStrictEqual(
      stripVTControlCharacters(output).split("\n"),
      (
        `
┌─────────┬──────────────────────────────┬─────────────────────────────────────────────┬────────────────────────────────────────────┬────────────────────┐
│ (index) │ Fish (alias)                 │ Description                                 │ Usage                                      │ Status             │
├─────────┼──────────────────────────────┼─────────────────────────────────────────────┼────────────────────────────────────────────┼────────────────────┤
│ 1       │ 'fish_open_npm'              │ "Quickly open a package's npm page"         │ 'fish_open_npm [--site=npmx] [pkg_name]'   │ '⬜ Not installed' │
│ 2       │ 'fish_pnpm_init_node_js_pkg' │ 'Quickly initialize a Node.js pnpm project' │ 'fish_pnpm_init_node_js_pkg [folder_name]' │ '⬜ Not installed' │
└─────────┴──────────────────────────────┴─────────────────────────────────────────────┴────────────────────────────────────────────┴────────────────────┘

` +
        `📁 Install path: ~\\.pelican\\alias-list\\index.sh`.replace(
          "~",
          homedir(),
        ) +
        `

💡 Run \`pelican catch <fish>\` to install
`
      ).split("\n"),
    )
  })

  it("#integration should output Chinese when LANG=zh", async () => {
    const output = await captureOutput("zh_CN.UTF-8")
    assert.ok(
      output.includes("未安装") ||
        output.includes("已安装") ||
        output.includes("没有可用的"),
      `Expected Chinese status labels in:\n${output}`,
    )
    assert.ok(
      output.includes("安装路径") || output.includes("运行"),
      `Expected Chinese footer in:\n${output}`,
    )
  })

  it("#integration should output English when LANG=en", async () => {
    const output = await captureOutput("en_US.UTF-8")
    assert.ok(
      output.includes("Not installed") ||
        output.includes("Installed") ||
        output.includes("No available"),
      `Expected English status labels in:\n${output}`,
    )
    assert.ok(
      output.includes("Install path") || output.includes("Run"),
      `Expected English footer in:\n${output}`,
    )
  })

  it("#integration should show Chinese template descriptions", async () => {
    const output = await captureOutput("zh_CN.UTF-8")
    assert.ok(
      output.includes("快速打开 npm 包页"),
      `Expected Chinese description in:\n${output}`,
    )
  })

  it("#integration should show English template descriptions", async () => {
    const output = await captureOutput("en_US.UTF-8")
    assert.ok(
      output.includes("Quickly open a package's npm page"),
      `Expected English description in:\n${output}`,
    )
  })
})
