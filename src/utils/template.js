/**
 * 模板读取工具
 * @import { AliasInfo } from '../types.js'
 */

import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TEMPLATES_DIR = join(__dirname, "../../templates")

/**
 * 列出所有可用的 alias 模板
 * @returns {AliasInfo[]}
 */
export function listAvailableAliases() {
  const files = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".sh"))

  return files.map((file) => {
    const name = file.replace(/\.sh$/, "")
    const content = readFileSync(join(TEMPLATES_DIR, file), "utf-8")
    const descMatch = content.match(/^# desc:\s*(.+)/m)
    return {
      name,
      description: descMatch ? descMatch[1] : "",
      source: content,
    }
  })
}

/**
 * 加载指定 alias 模板
 * @param {string} aliasName
 * @returns {AliasInfo | null}
 */
export function loadTemplate(aliasName) {
  const filePath = join(TEMPLATES_DIR, `${aliasName}.sh`)
  if (!existsSync(filePath)) {
    return null
  }
  const content = readFileSync(filePath, "utf-8")
  const descMatch = content.match(/^# desc:\s*(.+)/m)

  const description = descMatch?.[1]
  if (!description) {
    throw new Error(`Template ${aliasName} does not have a description`)
  }

  return {
    name: aliasName,
    description,
    source: content,
  }
}
