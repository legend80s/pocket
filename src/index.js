#!/usr/bin/env node

/**
 * Pocket CLI 主入口
 * @import { AddOptions, ParsedArgs } from './types.js'
 */

import { parseArgs } from "node:util"
import pkg from "../package.json" with { type: "json" }
import { addCommand } from "./commands/add.js"
import { listCommand } from "./commands/list.js"

// console.log("pkg:", pkg)

const VERSION = pkg.version

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
> 🧰 pelican - 从口袋里掏出你的专属命令行工具

## 用法:
  pelican catch <alias...>    安装一个或多个 alias
  pelican list                列出所有 alias
  pelican --version, -v       显示版本号
  pelican --help, -h          显示帮助信息

## 示例:
  pelican catch                               交互式选择安装
  pelican catch <fish_name1>                  安装一个
  pelican catch <fish_name1> <fish_name2> ... 批量安装

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
    strict: true,
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
    console.log(`pelican v${VERSION}`)
    return
  }

  // list 命令
  if (list || command === "list") {
    await listCommand()
    return
  }

  // add 命令
  if (command && ["add", "catch", "捕鱼", "捕捉"].includes(command)) {
    await addCommand(aliases, options)
    return
  }

  // 未知命令 → 列出所有 alias
  // console.log(`❌ 未知命令: ${command}`)
  await listCommand()
}

main().catch((err) => {
  console.error("❌ 发生错误:", err.message)
  process.exit(1)
})
