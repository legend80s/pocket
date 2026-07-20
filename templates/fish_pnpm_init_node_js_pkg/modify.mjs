// @ts-check
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { styleText } from "node:util"

// process.argv: [
//   'C:\\Program Files\\nodejs\\node.exe',
//   'C:\\Users\\foo\\.pelican\\modify.mjs',
//   'D:/workspace/bar/project/temp'
// ]
// console.log('process.argv:', process.argv);

async function main() {
  const dir = process.argv[2]
  if (!dir) {
    console.error("No directory provided, process.argv:", process.argv)
    process.exit(1)
  }

  modifyTsConfig(dir)

  // console.log('\nbiome.json before:');
  // console.log(biomeJson);
  console.log()

  await modifyBiome(dir)
  // console.log('\nbiome.json after:');
  // console.log(biomeJson);
}

main()

/**
 * Add --types=node --checkJs=true
 * @param {string} dir
 * @returns {void}
 */
function modifyTsConfig(dir) {
  console.log("⏳  Starting to update tsconfig.json")

  const TS_CONFIG = path.join(dir, "./tsconfig.json")
  let content = readFileSync(TS_CONFIG, "utf8")
  let modified = false

  // 1. Replace `"types": []` to `"types": ["node"]`
  const empty = '"types": []'
  if (content.includes(empty)) {
    content = content.replace(empty, '"types": ["node"]')
    modified = true
    console.log('  ✓ Added `"types": ["node"]`')
  }

  // 2. Add `"checkJs": true` if not exists
  if (!content.includes('"checkJs":')) {
    // Placed after `"strict": true,`
    content = content.replace(/("strict":\s*true,\s*)/, (match, p1) => {
      // get indentation
      const indent = match.match(/^(\s*)/)?.[0] || "    "
      return `${p1}\n${indent}"checkJs": true,\n${indent}`
    })
    modified = true
    console.log('  ✓ Added `"checkJs": true`')
  } else {
    console.log('  ℹ "checkJs" already exists, skipping')
  }

  if (!modified) {
    console.log("⚠️  No changes detected")
    process.exit(0)
  }

  writeFileSync(TS_CONFIG, content, "utf8")

  console.log("✅ Successfully updated", `"${TS_CONFIG}"`)
}

/**
 * @param {string} dir
 * @returns {Promise<void>}
 */
async function modifyBiome(dir) {
  const biomeJsonPath = path.join(dir, "./biome.json")
  const fileUrl = pathToFileURL(biomeJsonPath)
  // console.log('dir:', {dir, fileUrl});
  const { default: biomeJson } = await import(fileUrl.href, {
    with: { type: "json" },
  })

  // Modify biome.json here
  const updatedMsgs = []

  if (biomeJson.formatter.indentStyle !== "space") {
    updatedMsgs.push(
      `formatter.${green("indentStyle")} from ${biomeJson.formatter.indentStyle} to "${green("space")}"`,
    )
    biomeJson.formatter.indentStyle = "space"
  }

  if (biomeJson.linter.rules.style?.useBlockStatements !== "warn") {
    updatedMsgs.push(
      `linter.rules.style.${green("useBlockStatements")} from ${biomeJson.linter.rules.style?.useBlockStatements} to "${green("warn")}"`,
    )

    if (!biomeJson.linter.rules.style) {
      biomeJson.linter.rules.style = {}
    }

    biomeJson.linter.rules.style.useBlockStatements = "warn"
  }

  if (biomeJson.javascript.formatter.semicolons !== "asNeeded") {
    updatedMsgs.push(
      `biomeJson.javascript.formatter.${green("semicolons")} from ${biomeJson.javascript.formatter.semicolons} to "${green("asNeeded")}"`,
    )
    biomeJson.javascript.formatter.semicolons = "asNeeded"
  }

  // console.log("biomeJson:", biomeJson)

  if (!updatedMsgs.length) {
    console.log("No changes made to biome.json")

    return
  }

  // console.log("updatedMsgs:", updatedMsgs);

  console.log(
    "Updated biome.json with",
    updatedMsgs.length,
    `changes:
${updatedMsgs.map((msg) => `— ${msg}`).join("\n")}`,
  )

  const indent = readFileSync(biomeJsonPath).includes("\t") ? "\t" : 2

  writeFileSync(biomeJsonPath, `${JSON.stringify(biomeJson, null, indent)}\n`)
  console.log("Written to", `"${biomeJsonPath}"`)
}

/**
 * @param {string} text
 * @returns {string}
 */
function green(text) {
  return styleText("green", text)
}
