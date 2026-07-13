#!/usr/bin/env node

/**
 * 交互式创建 alias 模板
 */

import { existsSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import prompts from "prompts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TEMPLATES_DIR = join(__dirname, "..", "templates")

const NAME_RE = /^[a-z_][a-z0-9_]*$/

/**
 * @param {string} text
 */
function hasChinese(text) {
  return /[一-鿿]/.test(text)
}

async function main() {
  const response = await prompts([
    {
      type: "text",
      name: "name",
      message: "Alias name:",
      validate: (v) => {
        if (!NAME_RE.test(v)) {
          return "only lowercase letters, underscores, digits allowed, no leading digit"
        }
        const filePath = join(TEMPLATES_DIR, `${v}.sh`)
        if (existsSync(filePath)) {
          return `template "${v}" already exists`
        }
        return true
      },
    },
    {
      type: "text",
      name: "desc",
      message: "Description:",
      validate: (v) => (v ? true : "description is required"),
    },
    {
      type: "text",
      name: "usage",
      message: "Usage:",
    },
  ])

  // user cancelled
  if (!response.name) {
    process.exit(0)
  }

  const { name, desc, usage } = response
  const descIsZh = hasChinese(desc)
  const usageIsZh = hasChinese(usage)

  const content = [
    "#!/bin/bash",
    "",
    descIsZh
      ? `# desc: ${desc}`
      : `# desc.en: ${desc}`,
    usageIsZh
      ? `# usage: ${usage}`
      : `# usage.en: ${usage}`,
    "",
    // always write both desc and usage placeholders (the other locale)
    descIsZh ? "# desc.en:" : "# desc:",
    usageIsZh ? "# usage.en:" : "# usage:",
    "",
    '__fish_is_zh() {',
    '  [[ "${LANG:-}" =~ ^zh ]]',
    "}",
    "",
    "# @public",
    `${name}() {`,
    "  # TODO: implement",
    '  echo "not yet implemented"',
    "}",
    "",
  ].join("\n")

  const filePath = join(TEMPLATES_DIR, `${name}.sh`)
  writeFileSync(filePath, content, "utf-8")
  console.log(`\n✅ template created: ${filePath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
