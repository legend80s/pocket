export type ParsedArgs = {
  command?: string
  aliases: string[]
  options: AddOptions
  help: boolean
  version: boolean
  list: boolean
  dryRun: boolean
  verbose: boolean
  listFormat: "markdown" | "table"
}

/**
 * Pocket 配置
 */
export interface PocketConfig {
  /** Pocket 目录路径，默认为 ~/.pelican */
  pocketDir: string
  /** alias 存放目录，默认为 ~/.pelican/alias-list */
  aliasDir: string
  /** alias 索引文件路径，默认为 ~/.pelican/alias-list/index.sh */
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
  /** 使用方式，从 # usage: 读取 */
  usage: string
  /** 函数体源码 */
  source: string
}

/**
 * 加载后的模板信息（含类型）
 */
export interface TemplateInfo extends AliasInfo {
  /** "file" 为单文件模板， "dir" 为多文件目录模板 */
  type: "file" | "dir"
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
  dryRun: boolean
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
