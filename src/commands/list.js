/**
 * pelican list 命令
 */
import { existsSync } from "node:fs"
import { styleText } from "node:util"
import { getConfig, isAliasInstalled } from "../utils/config.js"
import { isChinese } from "../utils/lang.js"
import { t } from "../utils/locales.js"
import { listAvailableAliases } from "../utils/template.js"
import { printTable } from "../utils/logger.js"
/** @import { ILogger } from '../utils/logger.type.js' */

/**
 * 执行 list 命令
 * @param {{ printListResult?: boolean; logger?: ILogger; listFormat?: import('../types.js').ParsedArgs['listFormat'] }} options
 */
export async function listCommand({
  printListResult = true,
  logger,
  listFormat = "table",
} = {}) {
  const { aliasDir, aliasesFile } = getConfig()

  // 获取所有可用 alias
  const available = listAvailableAliases()
  // console.log("available:", available)

  if (available.length === 0) {
    console.log(t("list.error.no_templates"))
    return
  }

  // 创建别名到类型的映射（预扫描 aliasDir）
  /** @type {Record<string, boolean>} */
  const installedMap = {}
  if (existsSync(aliasDir)) {
    for (const alias of available) {
      installedMap[alias.name] = isAliasInstalled(aliasDir, alias.name)
    }
  }

  // console.log(`\n📦 可用 Alias (${available.length} 个):\n`)

  /** @type {Record<string, { 'Fish (alias)': string; Description: string; Usage: string; 'Installed?': string}>} */
  const all = {}

  let index = 1

  printListResult && console.log()

  const maxDescriptionLength = Math.max(
    ...available.map((alias) => alias.description.length),
  )
  // console.log("maxDescriptionLength:", maxDescriptionLength)

  // 单元测试中 terminalWidth 为 undefined，强制 markdown 输出，console.table diff 噪音大
  const terminalWidth = process.stdout.columns || 0

  const delta = isChinese() ? 92 : 50 // 208 - 127

  const maxLineWidth =
    Math.max(
      ...available.map(
        ({ name, description, usage }) =>
          name.length + description.length + usage.length,
      ),
    ) + delta

  // const isLineWrapped = false
  // const isLineWrapped = maxLineWidth > terminalWidth

  logger?.debug("maxLineWidth:", {
    // isLineWrapped,
    maxLineWidth,
    terminalWidth,
    maxDescriptionLength,
    isChinese: isChinese(),
  })

  const factor = isChinese() ? 5 / 3 : 1
  const separatorLength = maxDescriptionLength * factor + `❯ `.length
  const lineSeparator = styleText(
    "gray",
    "─".repeat(
      terminalWidth - 1 <= 0
        ? separatorLength
        : Math.min(terminalWidth - 1, separatorLength),
    ),
  )

  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" })
  /** @param {string} text  */
  function splitSentences(text) {
    return Array.from(segmenter.segment(text), (segment) => segment.segment)
  }

  for (const alias of available) {
    const installed = installedMap[alias.name] ?? false
    const status = installed
      ? t("list.status.installed")
      : t("list.status.not_installed")

    // all.push({
    all[`#${index}`] = {
      "Fish (alias)": `${styleText("green", String(index + "."))} ${alias.name}`,
      Description: `${styleText("gray", "❯")} ${alias.description}`,
      Usage: `${styleText("cyan", "❯")} ${alias.usage}`,
      "Installed?": installed ? "✅" : "⬜",
    }

    if (printListResult && listFormat === "markdown") {
      const statusText = installed ? green(status) : styleText("yellow", status)
      console.log(`${green(`## ${index}. ${alias.name}`)} → ${statusText}`)

      console.log()
      for (const sentence of splitSentences(alias.description)) {
        console.log(`${styleText("gray", "❯")} ${sentence}`)
      }
      console.log()
      // console.log(`\n${styleText("gray", "❯")} ${alias.description}\n`)
      console.log(`${styleText("cyan", "❯")} ${green(alias.usage)}`)
      console.log(lineSeparator)
      console.log(``)
    }

    index += 1
  }

  // console.log("all:", all)

  if (printListResult) {
    // console.log(all, "\n")
    if (listFormat === "table") {
      // console.log(all)
      // console.table(all)
      printTable(Object.values(all))
    }

    console.log(
      t("list.footer.path", {
        path: green(aliasesFile, "underline"),
      }),
    )
    console.log(t("list.footer.hint"))
  }

  return { all: available, installed: installedMap }
}

/**
 * @param {Parameters<typeof styleText>[1]} text
 * @param {Parameters<typeof styleText>[0]} format
 */
function green(text, format = []) {
  const greenFormat = [/** @type {const} */ ("green")].concat(
    // @ts-expect-error
    format,
  )
  return styleText(greenFormat, text)
}

/** @param {string} text */
function white(text) {
  return styleText("white", text)
}

/** @param {string} text */
function bold(text) {
  return styleText("bold", text)
}
