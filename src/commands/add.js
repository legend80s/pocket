/**
 * pocket add 命令
 * @import { AddOptions } from '../types.js'
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
  rmSync,
  cpSync,
} from "node:fs"
import prompts from "prompts"
import { detectShell, getConfig, getRcFile } from "../utils/config.js"
import {
  listAvailableAliases,
  loadTemplate,
  getTemplatesDir,
} from "../utils/template.js"
import { simpleDiff } from "../utils/diff.js"

/**
 * 确保 alias-list 目录存在
 * @param {string} aliasDir
 */
function ensureAliasDir(aliasDir) {
  if (!existsSync(aliasDir)) {
    mkdirSync(aliasDir, { recursive: true })
  }
}

/**
 * 确保 index.sh 存在
 * @param {string} aliasesFile
 */
function ensureIndexSh(aliasesFile) {
  if (!existsSync(aliasesFile)) {
    writeFileSync(aliasesFile, "# pocket alias index\n", "utf-8")
  }
}

/**
 * 确保 .zshrc 中有 source 引用
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
  const sourceLine = `source '${aliasesFile}'`

  if (!content.includes(sourceLine)) {
    appendFileSync(rcFile, `\n# pocket: source\n${sourceLine}\n`)
    return false
  }
  return true
}

/**
 * 检查 alias 是否已安装
 * @param {string} aliasDir
 * @param {string} name
 * @param {"file" | "dir"} type
 * @returns {boolean}
 */
function isInstalled(aliasDir, name, type) {
  if (type === "file") {
    return existsSync(`${aliasDir}/${name}.sh`)
  }
  return existsSync(`${aliasDir}/${name}`)
}

/**
 * 读取旧文件内容（用于 diff）
 * @param {string} aliasDir
 * @param {string} name
 * @param {"file" | "dir"} type
 * @returns {string}
 */
function readOldContent(aliasDir, name, type) {
  const path =
    type === "file"
      ? `${aliasDir}/${name}.sh`
      : `${aliasDir}/${name}/index.sh`
  try {
    return readFileSync(path, "utf-8")
  } catch {
    return ""
  }
}

/**
 * 部署模板到 alias-list
 * @param {string} aliasDir
 * @param {string} name
 * @param {{ name: string; type: "file" | "dir"; source: string }} template
 */
function deployTemplate(aliasDir, name, template) {
  if (template.type === "file") {
    writeFileSync(`${aliasDir}/${name}.sh`, template.source, "utf-8")
  } else {
    const srcDir = `${getTemplatesDir()}/${name}`
    const destDir = `${aliasDir}/${name}`
    cpSync(srcDir, destDir, { recursive: true })
  }
}

/**
 * 删除已安装的目标
 * @param {string} aliasDir
 * @param {string} name
 * @param {"file" | "dir"} type
 */
function removeTarget(aliasDir, name, type) {
  const target =
    type === "file" ? `${aliasDir}/${name}.sh` : `${aliasDir}/${name}`
  rmSync(target, { recursive: true, force: true })
}

/**
 * 确保 index.sh 中有 source 行（新增时）
 * @param {string} aliasesFile
 * @param {string} name
 * @param {"file" | "dir"} type
 */
function ensureSourceLine(aliasesFile, name, type) {
  const sourceLine =
    type === "file"
      ? `source ~/.pocket/alias-list/${name}.sh`
      : `source ~/.pocket/alias-list/${name}/index.sh`

  const content = readFileSync(aliasesFile, "utf-8")
  if (!content.includes(sourceLine)) {
    appendFileSync(aliasesFile, `${sourceLine}\n`)
  }
}

/**
 * 执行 add 命令
 * @param {string[]} aliasNames
 * @param {AddOptions} options
 */
export async function addCommand(aliasNames, options) {
  const config = getConfig()
  const { pocketDir, aliasDir, aliasesFile } = config

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

  // 3. 确保目录和 index.sh 存在
  ensureAliasDir(aliasDir)
  ensureIndexSh(aliasesFile)

  // 4. 确保 .zshrc 中有 source 引用
  const existed = ensureRcSource(rcFile, aliasesFile)

  // 5. 逐个安装 alias
  const results = []
  for (const name of targetAliases) {
    const template = loadTemplate(name)
    if (!template) {
      console.error(`❌ 未找到模板: ${name}`)
      results.push(
        /** @type {const} */ ({ name, success: false, error: "模板不存在" }),
      )
      continue
    }

    const installed = isInstalled(aliasDir, name, template.type)

    // 已存在且不强制覆盖 → 确认
    if (installed && !options.force) {
      const answer = await prompts({
        type: "confirm",
        name: "value",
        message: `⚠️  ${name} 已安装，是否覆盖？`,
        initial: false,
      })
      if (!answer.value) {
        results.push({
          name,
          success: true,
          data: /** @type {const} */ ({ action: "skipped" }),
        })
        continue
      }
    }

    if (installed) {
      // 覆盖模式：读旧内容 → 删旧 → 部署新 → 展示 diff
      const oldContent = readOldContent(aliasDir, name, template.type)
      removeTarget(aliasDir, name, template.type)
      deployTemplate(aliasDir, name, template)

      const diff = simpleDiff(oldContent, template.source)
      if (diff.hasDiff) {
        console.log(`\n📋 ${name} 变更：`)
        for (const line of diff.lines) {
          console.log(`  ${line}`)
        }
      } else {
        console.log(`\n📋 ${name}: 无差异`)
      }

      results.push({
        name,
        success: true,
        data: /** @type {const} */ ({ action: "updated" }),
      })
    } else {
      // 新增模式：部署 + 追加 source 行
      deployTemplate(aliasDir, name, template)
      ensureSourceLine(aliasesFile, name, template.type)
      results.push({
        name,
        success: true,
        data: /** @type {const} */ ({ action: "added" }),
      })
    }
  }

  // 6. 输出结果
  console.log("\n📦 安装结果:")
  for (const result of results) {
    if (!result.success) {
      console.log(`  ❌ ${result.name}: 失败 - ${result.error}`)
    } else if (result.data.action === "skipped") {
      console.log(`  ⏭️  ${result.name}: 已跳过`)
    } else if (result.data.action === "updated") {
      console.log(`  🔄 ${result.name}: 已更新`)
    } else if (result.data.action === "added") {
      console.log(`  ✅ ${result.name}: 已安装`)
    }
  }

  // 7. 提示生效
  if (
    results.some((result) => {
      return (
        result.success &&
        (result.data.action === "added" || result.data.action === "updated")
      )
    })
  ) {
    console.log(`\n✅ 已写入到 ${aliasesFile}`)

    if (!existed) {
      console.log(`📝 已追加 source 到 ${rcFile}`)
    }

    console.log(`\n重启终端以生效`)
  }
}
