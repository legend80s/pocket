/**
 * pocket list 命令
 * @import { InstalledAlias } from '../types.js'
 */

import { existsSync } from "node:fs"
import { getConfig } from "../utils/config.js"
import { listAvailableAliases } from "../utils/template.js"

/**
 * 检查 alias 是否已安装
 * @param {string} aliasDir
 * @param {string} name
 * @returns {boolean}
 */
function isInstalled(aliasDir, name) {
  return existsSync(`${aliasDir}/${name}`)
}

/**
 * 执行 list 命令
 */
export async function listCommand() {
  const { aliasDir, aliasesFile } = getConfig()

  // 获取所有可用 alias
  const available = listAvailableAliases()

  if (available.length === 0) {
    console.log("📭 没有可用的 alias 模板")
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

  /** @type {Record<string, { name: string; description: string; status: string}>} */
  const all = {}

  let index = 1

  for (const alias of available) {
    const installed = installedMap[alias.name] ?? false
    const status = installed ? "✅ 已安装" : "⬜ 未安装"

    all[index] = {
      name: alias.name,
      description: alias.description,
      status,
    }

    index += 1
  }

  console.table(all)

  console.log(`\n📁 安装路径: ${aliasesFile}`)
  console.log(`\n💡 运行 pocket add <alias> 安装`)
}
