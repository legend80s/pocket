/**
 * pelican list 命令
 * @import { InstalledAlias } from '../types.js'
 */

import { existsSync } from "node:fs"
import { styleText } from "node:util"
import { getConfig, isAliasInstalled } from "../utils/config.js"
import { t } from "../utils/locales.js"
import { listAvailableAliases } from "../utils/template.js"

/**
 * 执行 list 命令
 */
export async function listCommand(log = true) {
  const { aliasDir, aliasesFile } = getConfig()

  // 获取所有可用 alias
  const available = listAvailableAliases()

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

  /** @type {Record<string, { 'Fish (alias)': string; Description: string; Usage: string; Status: string}>} */
  const all = {}

  let index = 1

  log && console.log()

  for (const alias of available) {
    const installed = installedMap[alias.name] ?? false
    const status = installed
      ? t("list.status.installed")
      : t("list.status.not_installed")

    all[`#${index}`] = {
      "Fish (alias)": alias.name,
      Description: alias.description,
      Usage: alias.usage,
      Status: status,
    }

    // const statusText = installed ? green(status) : styleText("yellow", status)
    // console.log(`${green(`## ${index}. ${alias.name}`)} → ${statusText}`)
    // console.log(`- ${bold("Description")}: ${white(alias.description)}`)
    // console.log(`- ${bold("Usage")}: ${green(alias.usage, "white")}`)
    // console.log()

    index += 1
  }

  // console.log("all:", all)

  if (log) {
    console.log(all, "\n")

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
