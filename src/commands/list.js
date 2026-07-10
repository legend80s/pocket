/**
 * pelican list 命令
 * @import { InstalledAlias } from '../types.js'
 */

import { existsSync } from "node:fs"
import { getConfig } from "../utils/config.js"
import { listAvailableAliases } from "../utils/template.js"
import { t } from "../utils/locales.js"

/**
 * 检查 alias 是否已安装
 * @param {string} aliasDir
 * @param {string} name
 * @returns {boolean}
 */
function isInstalled(aliasDir, name) {
  // 单文件: <name>.sh, 多文件目录: <name>/
  return (
    existsSync(`${aliasDir}/${name}.sh`) || existsSync(`${aliasDir}/${name}`)
  )
}

/**
 * 执行 list 命令
 */
export async function listCommand() {
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
      installedMap[alias.name] = isInstalled(aliasDir, alias.name)
    }
  }

  // console.log(`\n📦 可用 Alias (${available.length} 个):\n`)

  /** @type {Record<string, { 'Fish (alias)': string; Description: string; Usage: string; Status: string}>} */
  const all = {}

  let index = 1

  for (const alias of available) {
    const installed = installedMap[alias.name] ?? false
    const status = installed
      ? t("list.status.installed")
      : t("list.status.not_installed")

    all[index] = {
      "Fish (alias)": alias.name,
      Description: alias.description,
      Usage: alias.usage,
      Status: status,
    }

    index += 1
  }

  console.log()
  console.table(all)

  console.log(t("list.footer.path", { path: aliasesFile }))
  console.log(t("list.footer.hint"))
}
