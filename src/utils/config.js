/**
 * @import { PocketConfig, ShellType } from '../types.js'
 */

import { homedir } from "node:os"
import { join } from "node:path"

/**
 * 获取 Pocket 配置
 * @returns {PocketConfig}
 */
export function getConfig() {
  const pocketDir = join(homedir(), ".pocket")
  return {
    pocketDir,
    aliasesFile: join(pocketDir, "aliases.sh"),
  }
}

/**
 * 检测当前 Shell 类型
 * @returns {ShellType}
 */
export function detectShell() {
  const shell = process.env.SHELL || ""
  if (shell.includes("zsh")) return "zsh"
  if (shell.includes("bash")) return "bash"
  return "unknown"
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
