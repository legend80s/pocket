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
 * 获取 templates 目录路径
 * @returns {string}
 */
export function getTemplatesDir() {
  return TEMPLATES_DIR
}

/**
 * 列出所有可用的 alias 模板
 * @returns {AliasInfo[]}
 */
export function listAvailableAliases() {
  const entries = readdirSync(TEMPLATES_DIR, { withFileTypes: true })
  /** @type {AliasInfo[]} */
  const result = []

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".sh")) {
      // 单文件模板: templates/foo.sh
      const name = entry.name.replace(/\.sh$/, "")
      const content = readFileSync(join(TEMPLATES_DIR, entry.name), "utf-8")
      const descMatch = content.match(/^# desc:\s*(.+)/m)
      result.push({
        name,
        description: descMatch?.[1] ?? "",
        source: content,
      })
    } else if (entry.isDirectory()) {
      // 多文件模板: templates/bar/index.sh
      const indexPath = join(TEMPLATES_DIR, entry.name, "index.sh")
      if (existsSync(indexPath)) {
        const name = entry.name
        const content = readFileSync(indexPath, "utf-8")
        const descMatch = content.match(/^# desc:\s*(.+)/m)
        result.push({
          name,
          description: descMatch?.[1] ?? "",
          source: content,
        })
      }
    }
  }

  return result
}

/**
 * 加载指定 alias 模板
 * @param {string} aliasName
 * @returns {AliasInfo & { type: "file" | "dir" } | null}
 */
export function loadTemplate(aliasName) {
  // 先试单文件 templates/<name>.sh
  const filePath = join(TEMPLATES_DIR, `${aliasName}.sh`)
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, "utf-8")
    const descMatch = content.match(/^# desc:\s*(.+)/m)
    const description = descMatch?.[1]
    if (!description) {
      throw new Error(`Template ${aliasName} does not have a description`)
    }
    return { name: aliasName, description, source: content, type: "file" }
  }

  // 再试多文件 templates/<name>/index.sh
  const dirPath = join(TEMPLATES_DIR, aliasName)
  const indexPath = join(dirPath, "index.sh")
  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, "utf-8")
    const descMatch = content.match(/^# desc:\s*(.+)/m)
    const description = descMatch?.[1]
    if (!description) {
      throw new Error(`Template ${aliasName} does not have a description`)
    }
    return { name: aliasName, description, source: content, type: "dir" }
  }

  return null
}
