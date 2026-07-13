#!/usr/bin/env node

/**
 * 交互式创建 alias 模板
 */

import { existsSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import prompts from "prompts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const TEMPLATES_DIR = join(__dirname, "..", "templates")

const PREFIX = "fish_"
const NAME_RE = new RegExp(`^${PREFIX}[a-z][a-z0-9_]*$`)

/**
 * @param {string} text
 */
function hasChinese(text) {
  return /\p{Script=Han}/u.test(text)
}

async function main() {
  let nameCollected = ""
  const response = await prompts([
    {
      type: "text",
      name: "name",
      message: "Alias name:",
      initial: PREFIX,
      validate: (v) => {
        if (!NAME_RE.test(v)) {
          return "Should starts with `fish_` and only lowercase letters, underscores, digits allowed"
        }
        const filePath = join(TEMPLATES_DIR, `${v}.sh`)
        if (existsSync(filePath)) {
          return `template "${v}" already exists`
        }

        nameCollected = v
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
      validate: (value, answers) => {
        // console.log("value:", value)
        // console.log("answers:", answers)

        /** @type {string} */
        const usage = value.trim()

        if (!usage.length) {
          return "usage is required"
        }

        if (!usage.includes(nameCollected)) {
          return "Did you forget to include the alias name in the usage?"
        }

        return true
      },
    },
  ])

  // user cancelled
  if (!response.name) {
    process.exit(0)
  }

  const { name, desc, usage } = response
  const descIsZh = hasChinese(desc)
  const usageIsZh = hasChinese(usage)

  const descPlaceholder = "<required: Why choose me>"
  const usagePlaceholder = "<required: How to use>"

  const content = `#!/bin/bash

# desc: ${descIsZh ? desc : descPlaceholder}
# usage: ${usage || usagePlaceholder}

# desc.en: ${!descIsZh ? desc : descPlaceholder}
# usage.en: ${usage || usagePlaceholder}

# @private
__fish_is_zh() {
  [[ "\${LANG:-}" =~ ^zh ]]
}

# @public
${name}() {
  # TODO: implement
  echo "not yet implemented"
}
`

  const filePath = join(TEMPLATES_DIR, `${name}.sh`)
  writeFileSync(filePath, content, "utf-8")
  console.log(`\n✅ template created: ${filePath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
