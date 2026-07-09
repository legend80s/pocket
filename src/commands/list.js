/**
 * pocket list 命令
 * @import { InstalledAlias } from '../types.js'
 */

import { existsSync } from "node:fs"
import { getConfig } from "../utils/config.js"
import { readAllAliases } from "../utils/parser.js"
import { listAvailableAliases } from "../utils/template.js"

/**
 * 执行 list 命令
 */
export async function listCommand() {
  const { aliasesFile } = getConfig()

  // 获取所有可用 alias
  const available = listAvailableAliases()

  if (available.length === 0) {
    console.log("📭 没有可用的 alias 模板")
    return
  }

  // 获取已安装的 alias 名称列表
  const installedNames = new Set()
  if (existsSync(aliasesFile)) {
    const installed = readAllAliases(aliasesFile)
    for (const alias of installed) {
      installedNames.add(alias.name)
    }
  }

  // 计算最长的 alias 名称长度，用于对齐
  // const maxNameLen = Math.max(...available.map((a) => a.name.length))

  console.log(`\n📦 可用 Alias (${available.length} 个):\n`)

  /** @type {Record<string, { name: string; description: string; status: string}>} */
  const all = {}

  let index = 1

  for (const alias of available) {
    const isInstalled = installedNames.has(alias.name)
    const status = isInstalled ? "✅ 已安装" : "⬜ 未安装"
    // const paddedName = alias.name.padEnd(maxNameLen)
    // console.log(`  ${paddedName}  ${status}  - ${alias.description}`)

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
