/**
 * @import { PocketConfig, ShellType } from '../types.js'
 */

import { existsSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { uniqueHomeDir } from "./constants.js"

/**
 * 获取 Pocket 配置
 * @returns {PocketConfig}s
 */
export function getConfig() {
  const pocketDir = join(homedir(), `.${uniqueHomeDir}`)

  return {
    pocketDir,
    aliasDir: join(pocketDir, "alias-list"),
    aliasesFile: join(pocketDir, "alias-list", "index.sh"),
  }
}

/**
 * 检测当前 Shell 类型
 * @returns {ShellType}
 */
export function detectShell() {
  // if ~/.zshrc exists, return "zsh"
  // if ~/.bashrc exists, return "bash"
  // else return "unknown"
  const zshrc = join(homedir(), ".zshrc")
  const bashrc = join(homedir(), ".bashrc")

  if (existsSync(zshrc)) {
    return "zsh"
  }

  if (existsSync(bashrc)) {
    return "bash"
  }

  const shell = process.env.SHELL || ""

  // console.log("shell:", shell) // is always `D:\app\Git\usr\bin\bash.exe` not zsh

  if (shell.includes("zsh")) {
    return "zsh"
  }
  if (shell.includes("bash")) {
    return "bash"
  }

  return "unknown"
}

if (import.meta.main) {
  console.log(detectShell())
}

/**
 * 检查 alias 是否已安装
 * @param {string} aliasDir
 * @param {string} name
 * @returns {boolean}
 */
export function isAliasInstalled(aliasDir, name) {
  return (
    existsSync(`${aliasDir}/${name}.sh`) ||
    existsSync(`${aliasDir}/${name}`)
  )
}

/**
 * 获取 Shell 配置文件路径
 * @param {ShellType} shell
 * @returns {string | null}
 */
export function getRcFile(shell) {
  const home = homedir()
  switch (shell) {
    case "zsh":
      return join(home, ".zshrc")
    case "bash":
      return join(home, ".bashrc")
    default:
      return null
  }
}
