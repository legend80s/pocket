/** @import { ILogger } from './logger.type.js' */

/**
 * @implements {ILogger}
 */
export class Logger {
  /**
   *
   * @param {boolean} debugging
   */
  constructor(debugging) {
    this.debugging = debugging
  }
  /**
   * for debugging purposes
   * @param {...unknown} args
   * @returns
   */
  debug = (...args) => {
    if (this.debugging) {
      console.log(`[DEBUG ${new Date().toLocaleString()}]`, ...args)
    }
  }
}

if (import.meta.main) {
  const debugging = false
  const { debug } = new Logger(debugging)

  debug("Running in main thread")

  // 示例数据（基于你提供的表格）

  // 使用示例 - 你的数据
  const scenarios = [
    {
      Name: "temp1",
      Source: "custom",
      Description: 'Custom scenario "my-scenario"',
    },
    {
      Name: "temp2",
      Source: "custom",
      Description: 'Custom scenario "my-scenario"',
    },
    { Name: "temp3", Source: "custom", Description: 'Custom scenario "temp3"' },
    { Name: "temp4", Source: "custom", Description: 'Custom scenario "temp4"' },
    { Name: "temp5", Source: "custom", Description: 'Custom scenario "temp5"' },
    {
      Name: "default",
      Source: "builtin",
      Description:
        "标准对话演示，包含 markdown 列表 / 代码块 / 表格 / 任务列表",
    },
    {
      Name: "different-pacing",
      Source: "builtin",
      Description: "演示具备不同生成速度",
    },
    {
      Name: "echo",
      Source: "builtin",
      Description:
        "🔥 Echo user messages as streaming markdown response — send any markdown as the last user message and see it streamed back streamed back streamed back streamed back streamed back streamed back streamed back streamed back",
    },
    {
      Name: "empty",
      Source: "builtin",
      Description: "直接返回 data: [DONE]，仅终止标记",
    },
    {
      Name: "english-i-have-a-dream",
      Source: "builtin",
      Description: "👨🏿‍🦱🎤🗽 Martin Luther King, Jr.",
    },
    {
      Name: "error-content-filter",
      Source: "builtin",
      Description: "模拟 HTTP 400 内容过滤错误",
    },
    {
      Name: "error-interrupted",
      Source: "builtin",
      Description: "输出到一半模拟流中断",
    },
    {
      Name: "error-malformed",
      Source: "builtin",
      Description: "输出内容包含不完整 JSON",
    },
    {
      Name: "error-rate-limit",
      Source: "builtin",
      Description: "模拟 HTTP 429 限流错误",
    },
    {
      Name: "error-server-error",
      Source: "builtin",
      Description: "模拟 HTTP 500 服务器内部错误",
    },
    { Name: "error-timeout", Source: "builtin", Description: "模拟连接超时" },
    { Name: "markdown-demo", Source: "builtin", Description: "完整 GFM 演示" },
  ]

  // 调用
  printTable(scenarios, {
    title: "Available scenarios 2:",
    // padding: 4,
    // truncate: true,
  })

  // 也可以自定义列顺序和筛选
  // printTable(scenarios, {
  //   columns: ['Name', 'Description'],  // 只显示这两列
  //   title: 'Available scenarios:'
  // });
}

/** @param {string} str  */
function getDisplayLength(str) {
  // 移除 ANSI 转义码计算实际显示长度
  // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
  return str.replace(/\x1b\[[0-9;]*m/g, "").length
}

/**
 *
 * @param {Array<Record<string, string>>} data
 * @param {Partial<{ columns: string[], title: string, padding: number, maxWidth: number }>} options
 * @returns
 */
export function printTable(data, options = {}) {
  if (!data || data.length === 0) {
    console.log("(empty)")
    return
  }

  const truncate = true

  // 获取所有列名
  /** @type {Set<string>} */
  const allKeys = new Set()
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      allKeys.add(key)
    })
  })

  const columns = options.columns || Array.from(allKeys)
  const padding = options.padding || 2
  const maxWidth = options.maxWidth || process.stdout.columns || 120

  // 计算每列最大宽度（使用显示长度）
  /** @type {Record<string, number>} */
  const colWidths = {}
  columns.forEach((col) => {
    let maxColWidth = getDisplayLength(col)

    data.forEach((row) => {
      const value = row[col] !== undefined ? String(row[col]) : ""
      const displayLen = getDisplayLength(value)
      maxColWidth = Math.max(maxColWidth, displayLen)
    })

    colWidths[col] = maxColWidth + padding
  })

  // 如果总宽度超过 maxWidth，截断长列
  const totalWidth = columns.reduce(
    (sum, col) =>
      // @ts-expect-error
      sum + colWidths[col],
    0,
  )
  const separatorWidth = columns.length - 1

  if (totalWidth + separatorWidth > maxWidth && truncate) {
    const needReduce = totalWidth + separatorWidth - maxWidth

    // 找出最长的列进行截断
    const sortedCols = [...columns].sort((a, b) => colWidths[b] - colWidths[a])

    let reduced = 0
    for (const col of sortedCols) {
      if (reduced >= needReduce) break

      const minWidth = getDisplayLength(col) + padding
      const canReduce = colWidths[col] - minWidth
      if (canReduce > 0) {
        const reduce = Math.min(canReduce, needReduce - reduced)
        colWidths[col] -= reduce
        reduced += reduce
      }
    }
  }

  // 构建分隔线
  const separator = columns
    .map((col) =>
      // @ts-expect-error
      "─".repeat(colWidths[col]),
    )
    .join(" ")

  // 构建表头
  const header = columns
    .map((col) => {
      // 表头左对齐，用空格填充到指定宽度
      const displayLen = getDisplayLength(col)
      // @ts-expect-error
      const paddingNeeded = colWidths[col] - displayLen
      return col + " ".repeat(paddingNeeded)
    })
    .join(" ")

  // 打印
  if (options.title) {
    console.log(`\n${options.title}\n`)
  }

  console.log(header)
  console.log(separator)

  // 打印数据行
  data.forEach((row) => {
    const line = columns
      .map((col) => {
        let value = row[col] !== undefined ? String(row[col]) : ""

        // 截断超长内容（使用显示长度）
        const displayLen = getDisplayLength(value)
        // @ts-expect-error
        if (displayLen > colWidths[col]) {
          // 需要截断，保留 ... 占 3 个字符
          // @ts-expect-error
          const targetLen = colWidths[col] - 3
          // 逐个字符截断，但保留 ANSI 颜色码
          let result = ""
          let currentLen = 0
          let inAnsi = false
          let ansiBuffer = ""

          for (let i = 0; i < value.length; i++) {
            const char = value[i]

            if (char === "\x1b") {
              inAnsi = true
              ansiBuffer = char
              continue
            }

            if (inAnsi) {
              ansiBuffer += char
              if (char === "m") {
                inAnsi = false
                result += ansiBuffer
                ansiBuffer = ""
              }
              continue
            }

            if (currentLen < targetLen) {
              result += char
              currentLen++
            } else {
              // 如果后续还有 ANSI 码需要保留
              if (ansiBuffer) {
                result += ansiBuffer
              }
              // 检查是否还有未闭合的 ANSI 码
              const remaining = value.substring(i)
              // biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
              const ansiMatch = remaining.match(/^\x1b\[[0-9;]*m/)
              if (ansiMatch) {
                result += ansiMatch[0]
              }
              break
            }
          }

          value = result + "..."
        }

        // 计算填充
        const displayLenFinal = getDisplayLength(value)
        // @ts-expect-error
        const paddingNeeded = colWidths[col] - displayLenFinal
        return value + " ".repeat(Math.max(0, paddingNeeded))
      })
      .join(" ")
    console.log(line.trim())
  })

  console.log("")
}
