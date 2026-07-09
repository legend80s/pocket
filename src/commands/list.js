/**
 * pocket list 命令
 * @import { InstalledAlias } from '../types.js'
 */

import { existsSync, readFileSync } from "node:fs"
import { getConfig } from "../utils/config.js"
import { readAllAliases } from "../utils/parser.js"

/**
 * 执行 list 命令
 */
export async function listCommand() {
  const { aliasesFile } = getConfig()

  if (!existsSync(aliasesFile)) {
    console.log("📭 尚未安装任何 alias")
    console.log(`运行 pocket add 来安装`)
    return
  }

  const aliases = readAllAliases(aliasesFile)

  if (aliases.length === 0) {
    console.log("📭 尚未安装任何 alias")
    console.log(`运行 pocket add 来安装`)
    return
  }

  console.log(`\n📦 已安装的 alias (${aliases.length} 个):\n`)
  for (const alias of aliases) {
    const desc = alias.description ? `- ${alias.description}` : ""
    console.log(`  ${alias.name.padEnd(12)} ${desc}`)
  }
  console.log(`\n📁 文件: ${aliasesFile}`)
}
