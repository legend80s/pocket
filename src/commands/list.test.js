import assert from "node:assert"
import { describe, it, mock, after } from "node:test"

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
