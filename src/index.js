#!/usr/bin/env node

/**
 * Pocket CLI 主入口
 * @import { AddOptions, ParsedArgs } from './types.js'
 */

import { parseArgs } from "node:util"
import { addCommand } from "./commands/add.js"
import { listCommand } from "./commands/list.js"

const VERSION = "0.1.0"

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
🧰 pocket - 从口袋里掏出你的专属命令行工具

用法:
  pocket add <alias...>    安装一个或多个 alias
  pocket list              列出已安装的 alias
  pocket --version, -v     显示版本号
  pocket --help, -h        显示帮助信息

示例:
  pocket add opennpm       安装 opennpm
  pocket add opennpm opengh 批量安装
  pocket add               交互式选择安装
  pocket add opennpm --force 强制覆盖

文档:
  https://github.com/legend80s/pocket
  `)
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
      debug: { type: "boolean" },
    },
    allowPositionals: true,
    strict: false,
  })

  // console.log("values:", values)
  // console.log("positionals:", positionals)

  // 解析子命令（第一个位置参数）
  const command = positionals[0] || ""
  // 别名列表（从第二个位置参数开始，排除以 -- 开头的选项）
  const aliases = positionals.slice(1).filter((arg) => !arg.startsWith("-"))

  return {
    command,
    aliases,
    options: {
      force: values.force ?? false,
    },
    help: values.help ?? false,
    version: values.version ?? false,
    list: values.list ?? false,
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)

  const { command, aliases, options, help, version, list } = parseArgsAll(args)

  if (args.length === 0) {
    // 无参数 → 交互式 add
    await addCommand([], { force: false })
    return
  }

  // --help 或 -h
  if (help) {
    showHelp()
    return
  }

  // --version 或 -v
  if (version) {
    console.log(`pocket v${VERSION}`)
    return
  }

  // list 命令
  if (list || command === "list") {
    await listCommand()
    return
  }

  // add 命令（默认命令，即使不写 add 也支持）
  if (command === "add" || command === "") {
    await addCommand(aliases, options)
    return
  }

  // 未知命令，显示帮助
  console.log(`❌ 未知命令: ${command}`)
  showHelp()
  process.exit(1)
}

main().catch((err) => {
  console.error("❌ 发生错误:", err.message)
  process.exit(1)
})
