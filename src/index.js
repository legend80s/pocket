#!/usr/bin/env node

/**
 * Pocket CLI 主入口
 * @import { AddOptions, ParsedArgs } from './types.js'
 */

import { parseArgs } from "node:util"
import pkg from "../package.json" with { type: "json" }
import { addCommand } from "./commands/add.js"
import { listCommand } from "./commands/list.js"
import { t } from "./utils/locales.js"
import { Logger } from "./utils/logger.js"

// console.log("pkg:", pkg)

const VERSION = pkg.version

/** @type {Logger} */
let logger

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(t("help.text"))
}

/**
 * 解析全局参数
 * @param {string[]} args
 * @returns {ParsedArgs}
 */
function parseArgsAll(args) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      list: { type: "boolean", short: "l" },
      force: { type: "boolean" },
      // debug: { type: "boolean" },
      verbose: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      "list-format": { type: "string", default: "adaptive" },
    },
    allowPositionals: true,
    strict: true,
  })

  const verbose = values.verbose

  logger = new Logger(verbose)

  logger.debug("values:", values)
  // throw new Error("test")
  logger.debug("positionals:", positionals)

  // 解析子命令（第一个位置参数）
  const command = positionals[0] || ""
  // 别名列表（从第二个位置参数开始，排除以 -- 开头的选项）
  const aliases = positionals.slice(1).filter((arg) => !arg.startsWith("-"))

  const dryRun = values["dry-run"]

  return {
    command,
    aliases,
    options: {
      force: values.force ?? false,
      dryRun,
    },
    help: values.help ?? false,
    version: values.version ?? false,
    list: values.list ?? false,
    dryRun,
    // @ts-expect-error
    listFormat: values["list-format"],
    verbose,
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)

  const { command, aliases, options, help, version, list, dryRun, listFormat } =
    parseArgsAll(args)

  // if (args.length === 0) {
  //   // 无参数 → 交互式 add
  //   await addCommand([], { force: false })
  //   return
  // }

  // --help 或 -h
  if (help) {
    showHelp()
    return
  }

  // --version 或 -v
  if (version) {
    console.log(`\n${t("version.label", { version: VERSION })}`)
    return
  }

  if (dryRun) {
    console.log(`\n> dry run mode ON, no action will be performed.\n`)
  }

  const listCmd = listCommand.bind(null, { logger, listFormat })

  // list 命令
  if (list || command === "list") {
    await listCmd()
    return
  }

  // add 命令
  if (command && ["add", "catch", "捕鱼", "捕捉"].includes(command)) {
    await addCommand(aliases, options)
    return
  }

  // 未知命令 → 列出所有 alias
  // console.log(`❌ 未知命令: ${command}`)
  await listCmd()
}

main().catch((err) => {
  console.error(t("error.generic", { message: err.message }))
  process.exit(1)
})
