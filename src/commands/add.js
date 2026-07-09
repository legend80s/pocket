/**
 * pocket add 命令
 * @import { AddOptions, Result, InstalledAlias } from '../types.js'
 */

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import prompts from "prompts"
import { detectShell, getConfig, getRcFile } from "../utils/config.js"
import {
  findAliasInFile,
  MARKER_END,
  // extractAliasInfo,
  // readAllAliases,
  MARKER_START,
} from "../utils/parser.js"
import { listAvailableAliases, loadTemplate } from "../utils/template.js"

/**
 * 确保 Pocket 目录存在
 * @param {string} pocketDir
 */
function ensurePocketDir(pocketDir) {
  if (!existsSync(pocketDir)) {
    mkdirSync(pocketDir, { recursive: true })
  }
}

/**
 * 确保 .zshrc 中有 source ~/.pocket/aliases.sh
 * @param {string} rcFile
 * @param {string} aliasesFile
 * @returns {boolean} 是否已存在
 */
function ensureRcSource(rcFile, aliasesFile) {
  if (!existsSync(rcFile)) {
    console.error(`❌ 未找到配置文件: ${rcFile}`)
    console.error(`请先创建 ${rcFile} 文件`)
    process.exit(1)
  }

  const content = readFileSync(rcFile, "utf-8")
  const sourceLine = `source ${aliasesFile}`

  if (!content.includes(sourceLine)) {
    appendFileSync(rcFile, `\n# pocket: source\n${sourceLine}\n`)
    return false
  }
  return true
}

/**
 * 将 alias 写入 aliases.sh
 * @param {string} aliasesFile
 * @param {string} aliasName
 * @param {string} source
 * @param {boolean} force
 * @returns {Promise<Result<{ action: 'added' | 'updated' | 'skipped' }>>}
 */
async function writeAlias(aliasesFile, aliasName, source, force) {
  // 确保 aliases.sh 存在
  if (!existsSync(aliasesFile)) {
    // 创建新文件，写入 start 标记
    const header = `${MARKER_START}\n\n${MARKER_END}\n`
    writeFileSync(aliasesFile, header, "utf-8")
  }

  const content = readFileSync(aliasesFile, "utf-8")
  const existing = findAliasInFile(content, aliasName)

  // 如果已存在且不强制覆盖
  if (existing && !force) {
    const answer = await prompts({
      type: "confirm",
      name: "value",
      message: `⚠️  ${aliasName} 已存在，是否覆盖？`,
      initial: false,
    })
    if (!answer.value) {
      return { success: true, data: { action: "skipped" } }
    }
  }

  const block = `# pocket:${aliasName}\n${source}\n`

  if (existing) {
    // 替换已有内容
    const before = content.slice(0, existing.startIndex)
    const after = content.slice(existing.endIndex)
    const newContent = before + block + after
    writeFileSync(aliasesFile, newContent, "utf-8")
    return { success: true, data: { action: "updated" } }
  } else {
    // 在 end 标记前插入
    const endIndex = content.indexOf(MARKER_END)
    if (endIndex === -1) {
      return { success: false, error: "aliases.sh 文件格式损坏：缺少结束标记" }
    }
    const before = content.slice(0, endIndex)
    const after = content.slice(endIndex)
    const newContent = before + block + after
    writeFileSync(aliasesFile, newContent, "utf-8")
    return { success: true, data: { action: "added" } }
  }
}

/**
 * 执行 add 命令
 * @param {string[]} aliasNames
 * @param {AddOptions} options
 */
export async function addCommand(aliasNames, options) {
  const config = getConfig()
  const { pocketDir, aliasesFile } = config

  // 1. 检测 shell
  const shell = detectShell()
  if (shell === "unknown") {
    console.error("❌ 无法检测 Shell 类型，请确保使用 zsh 或 bash")
    process.exit(1)
  }

  const rcFile = getRcFile(shell)
  if (!rcFile) {
    console.error("❌ 无法获取 Shell 配置文件路径")
    process.exit(1)
  }

  // 2. 如果没有指定 alias 名称，交互式选择
  let targetAliases = aliasNames
  if (targetAliases.length === 0) {
    const available = listAvailableAliases()
    if (available.length === 0) {
      console.error("❌ 没有可用的 alias 模板")
      process.exit(1)
    }

    const response = await prompts({
      type: "multiselect",
      name: "selected",
      message: "选择要安装的 alias（空格选择，回车确认）",
      choices: available.map(({ name, description }) => ({
        title: name,
        description,
        value: name,
      })),
      instructions: false,
    })

    targetAliases = response.selected || []
    if (targetAliases.length === 0) {
      console.log("👋 未选择任何 alias，退出")
      return
    }
  }

  // 3. 确保 Pocket 目录存在
  ensurePocketDir(pocketDir)

  // 4. 确保 .zshrc 中有 source 引用
  const existed = ensureRcSource(rcFile, aliasesFile)

  // 5. 逐个安装 alias
  const results = []
  for (const name of targetAliases) {
    const template = loadTemplate(name)
    if (!template) {
      console.error(`❌ 未找到模板: ${name}`)
      results.push({ name, success: false, error: "模板不存在" })
      continue
    }

    const result = await writeAlias(
      aliasesFile,
      name,
      template.source,
      options.force,
    )
    results.push({ name, success: result.success, ...result.data })
  }

  // 6. 输出结果
  console.log("\n📦 安装结果:")
  for (const r of results) {
    if (!r.success) {
      console.log(`  ❌ ${r.name}: 失败 - ${r.error}`)
    } else if (r.action === "skipped") {
      console.log(`  ⏭️  ${r.name}: 已跳过`)
    } else if (r.action === "updated") {
      console.log(`  🔄 ${r.name}: 已更新`)
    } else if (r.action === "added") {
      console.log(`  ✅ ${r.name}: 已安装`)
    }
  }

  // 7. 提示生效
  if (results.some((r) => r.action === "added" || r.action === "updated")) {
    console.log(`\n✅ 已写入到 ${aliasesFile}`)
    if (!existed) {
      console.log(`📝 已追加 source 到 ${rcFile}`)
    }
    console.log(`\n请运行 source ${rcFile} 或重启终端以生效`)
  }
}
