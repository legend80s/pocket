import assert from "node:assert"
import { execSync } from "node:child_process"
import { homedir } from "node:os"
import { after, describe, it, mock } from "node:test"
import { stripVTControlCharacters } from "node:util"
import { listCommand } from "./list.js"

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
      await listCommand()
    } finally {
      process.stdout.write = origWrite
    }

    return outputChunks.join("")
  }

  it("#integration should output Chinese when LANG=zh", (t) => {
    const output = execSync("node ./bin/pocket.js list", {
      env: {
        ...process.env, // 保留原有环境变量
        LANG: "zh", // 添加或覆盖 LANG
      },
    }).toString("utf-8")
    // console.log("output:", output)

    // const result = await listCommand(false)

    // if (!result) {
    //   throw new Error("Command failed")
    // }

    // const { installed } = result
    // const fish1 = installed["fish_open_npm"]
    // const tip1 = fish1 ? `✅ 已安装` : `⬜ 未安装`
    // const fish2 = installed["fish_pnpm_init_node_js_pkg"]
    // const tip2 = fish2 ? `✅ 已安装` : `⬜ 未安装`
    // const fish3 = installed["fish_open_repo"]
    // const tip3 = fish3 ? `✅ 已安装` : `⬜ 未安装`

    const [table] = output.split("📁")

    // console.log("table:", table)

    t.assert.snapshot(table?.split("\n"))

    assert.ok(
      stripVTControlCharacters(output).includes(
        `📁 安装路径: ~\\.pelican\\alias-list\\index.sh`.replace(
          "~",
          homedir(),
        ) +
          `

💡 运行 \`pelican catch <fish>\` 安装
`,
      ),
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

    const result = await listCommand(false)

    if (!result) {
      throw new Error("Command failed")
    }

    const { all, installed, ...rest } = result

    const must = [
      "fish_open_npm",
      "fish_open_repo",
      "fish_pnpm_init_node_js_pkg",
    ]
    assert.deepStrictEqual(
      new Set(Object.keys(installed)).intersection(new Set(must)),
      new Set(must),
    )

    assert.deepStrictEqual(
      must.map((alias) => installed[alias]),
      [true, true, false],
    )

    const withoutCode = all
      .filter((item) => must.includes(item.name))
      .map(({ source, ...rest }) => rest)

    assert.deepStrictEqual(
      { all: withoutCode, ...rest },
      {
        all: [
          {
            description: "快速打开 npm 包页",
            name: "fish_open_npm",
            usage: "fish_open_npm [--site=npmx] [包名]",
          },
          {
            description:
              "打开当前项目的远程仓库 URL，无论它是 GitHub、GitLab 还是私有部署的代码平台",
            name: "fish_open_repo",
            usage: "fish_open_repo",
          },
          {
            description: "快速初始化 Node.js pnpm 项目",
            name: "fish_pnpm_init_node_js_pkg",
            usage: "fish_pnpm_init_node_js_pkg [文件夹名]",
          },
        ],
      },
    )

    const colorlessOutput = stripVTControlCharacters(output)

    assert.ok(
      colorlessOutput.includes(
        `📁 Install path: ~\\.pelican\\alias-list\\index.sh`.replace(
          "~",
          homedir(),
        ),
      ),
    )

    assert.ok(
      colorlessOutput.includes("💡 Run `pelican catch <fish>` to install"),
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
