export type ParsedArgs = {
  command?: string
  aliases: string[]
  options: AddOptions
  help: boolean
  version: boolean
  list: boolean
}

/**
 * Pocket 配置
 */
export interface PocketConfig {
  /** Pocket 目录路径，默认为 ~/.pocket */
  pocketDir: string
  /** alias 文件路径，默认为 ~/.pocket/aliases.sh */
  aliasesFile: string
}

/**
 * Alias 信息
 */
export interface AliasInfo {
  /** alias 名称，如 opennpm */
  name: string
  /** alias 描述，从 # desc: 读取 */
  description: string
  /** 函数体源码 */
  source: string
}

/**
 * 已安装 Alias 信息（包含在文件中的位置）
 */
export interface InstalledAlias extends AliasInfo {
  /** 在 aliases.sh 中的起始行号 */
  startLine: number
  /** 在 aliases.sh 中的结束行号 */
  endLine: number
  /** 在 aliases.sh 中的起始字节偏移 */
  startIndex: number
  /** 在 aliases.sh 中的结束字节偏移 */
  endIndex: number
}

/**
 * Shell 类型
 */
export type ShellType = "zsh" | "bash" | "unknown"

/**
 * add 命令选项
 */
export interface AddOptions {
  /** 强制覆盖 */
  force: boolean
}

/**
 * 操作结果
 */
export type Result<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }

/**
 * 安装结果数据
 */
export interface AddResultData {
  action: "added" | "updated" | "skipped"
}
