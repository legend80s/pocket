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
> 🧰 pocket - 从口袋里掏出你的专属命令行工具

## 用法:
  pocket add <alias...>      安装一个或多个 alias
  pocket list                列出所有 alias
  pocket --version, -v       显示版本号
  pocket --help, -h          显示帮助信息

## 示例:
  pocket add opennpm         安装 opennpm
  pocket add opennpm opengh  批量安装
  pocket add                 交互式选择安装
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
      // @ts-expect-error
      force: values.force ?? false,
    },
    // @ts-expect-error
    help: values.help ?? false,
    // @ts-expect-error
    version: values.version ?? false,
    // @ts-expect-error
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
    console.log(`pocket v${VERSION}`)
    return
  }

  // list 命令
  if (list || command === "list") {
    await listCommand()
    return
  }

  // add 命令
  if (command === "add") {
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
