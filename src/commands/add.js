/**
 * pelican add 命令
 * @import { AddOptions } from '../types.js'
 */

import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { styleText } from "node:util"
import prompts from "prompts"
import { detectShell, getConfig, getRcFile } from "../utils/config.js"
import { uniqueHomeDir } from "../utils/constants.js"
import { simpleDiff } from "../utils/diff.js"
import { t } from "../utils/locales.js"
import {
  getTemplatesDir,
  listAvailableAliases,
  loadTemplate,
} from "../utils/template.js"

/**
 * 确保 alias-list 目录存在
 * @param {string} aliasDir
 * @param {boolean} dryRun
 */
function ensureAliasDir(aliasDir, dryRun) {
  if (dryRun) {
    return
  }
  if (!existsSync(aliasDir)) {
    mkdirSync(aliasDir, { recursive: true })
  }
}

/**
 * 确保 index.sh 存在
 * @param {string} aliasesFile
 * @param {boolean} dryRun
 */
function ensureIndexSh(aliasesFile, dryRun) {
  if (dryRun) {
    return
  }
  if (!existsSync(aliasesFile)) {
    writeFileSync(aliasesFile, "# pelican alias index\n", "utf-8")
  }
}

/**
 * 确保 .zshrc 中有 source 引用
 * @param {string} rcFile
 * @param {string} aliasesFile
 * @param {boolean} dryRun
 * @returns {boolean} 是否已存在
 */
function ensureRcSource(rcFile, aliasesFile, dryRun) {
  if (!existsSync(rcFile)) {
    console.error(t("add.error.rc_not_found.path", { path: rcFile }))
    console.error(t("add.error.rc_not_found.create", { path: rcFile }))
    process.exit(1)
  }

  if (dryRun) {
    return true
  }

  const content = readFileSync(rcFile, "utf-8")
  const sourceLine = `source '${aliasesFile}'`

  if (!content.includes(sourceLine)) {
    appendFileSync(rcFile, `\n# pelican: source\n${sourceLine}\n`)
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
    type === "file" ? `${aliasDir}/${name}.sh` : `${aliasDir}/${name}/index.sh`
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
      ? `source ~/.${uniqueHomeDir}/alias-list/${name}.sh`
      : `source ~/.${uniqueHomeDir}/alias-list/${name}/index.sh`

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
export async function addCommand(aliasNames, { dryRun, force }) {
  const config = getConfig()
  const { pocketDir, aliasDir, aliasesFile } = config

  // 1. 检测 shell
  const shell = detectShell()
  if (shell === "unknown") {
    console.error(t("add.error.shell_detect"))
    process.exit(1)
  }

  const rcFile = getRcFile(shell)
  if (!rcFile) {
    console.error(t("add.error.no_rc_file"))
    process.exit(1)
  }

  // 2. 如果没有指定 alias 名称，交互式选择
  let targetAliases = aliasNames
  if (targetAliases.length === 0) {
    const available = listAvailableAliases()
    if (available.length === 0) {
      console.error(t("add.error.no_templates"))
      process.exit(1)
    }

    const response = await prompts({
      type: "multiselect",
      name: "selected",
      message: t("add.prompt.select_aliases"),
      choices: available.map(({ name, description }) => ({
        title: name,
        description,
        value: name,
      })),
      instructions: false,
    })

    targetAliases = response.selected || []
    if (targetAliases.length === 0) {
      console.log(`\n${t("add.log.no_selection")}`)
      return
    }
  }

  // 3. 确保目录和 index.sh 存在
  ensureAliasDir(aliasDir, dryRun)
  ensureIndexSh(aliasesFile, dryRun)

  // 4. 确保 .zshrc 中有 source 引用
  const existed = ensureRcSource(rcFile, aliasesFile, dryRun)

  // 5. 逐个安装 alias
  const results = []
  for (const name of targetAliases) {
    const template = loadTemplate(name)
    if (!template) {
      console.error(t("add.error.template_not_found", { name }))
      results.push(
        /** @type {const} */ ({
          name,
          usage: "",
          success: false,
          error: t("add.error.template_not_exist"),
        }),
      )
      continue
    }

    const installed = isInstalled(aliasDir, name, template.type)

    // 已存在且不强制覆盖 → 确认
    if (installed && !force) {
      const answer = await prompts({
        type: "confirm",
        name: "value",
        message: t("add.prompt.confirm_overwrite", { name }),
        initial: false,
      })
      if (!answer.value) {
        results.push({
          name,
          usage: template.usage,
          success: true,
          data: /** @type {const} */ ({ action: "skipped" }),
        })
        continue
      }
    }

    if (installed) {
      // 覆盖模式：读旧内容 → 删旧 → 部署新 → 展示 diff
      if (!dryRun) {
        const oldContent = readOldContent(aliasDir, name, template.type)
        removeTarget(aliasDir, name, template.type)
        deployTemplate(aliasDir, name, template)

        const diff = simpleDiff(oldContent, template.source)

        if (diff.hasDiff) {
          console.log(t("add.log.changes_header", { name }))
          for (const line of diff.lines) {
            console.log(`  ${line}`)
          }
        } else {
          console.log(t("add.log.no_diff", { name }))
        }
      }

      results.push({
        name,
        usage: template.usage,
        success: true,
        data: /** @type {const} */ ({ action: "updated" }),
      })
    } else {
      // 新增模式：部署 + 追加 source 行
      if (!dryRun) {
        deployTemplate(aliasDir, name, template)
        ensureSourceLine(aliasesFile, name, template.type)
      }
      results.push({
        name,
        usage: template.usage,
        success: true,
        data: /** @type {const} */ ({ action: "added" }),
      })
    }
  }

  // 6. 输出结果
  console.log(t("add.result.header"))
  let index = 0
  for (const result of results) {
    const indexText = results.length > 1 ? `${++index}. ` : ""
    if (!result.success) {
      console.log(
        t("add.result.failed", { name: result.name, error: result.error }),
      )
    } else if (result.data.action === "skipped") {
      console.log(indexText + t("add.result.skipped", { name: result.name }))
    } else {
      const actionText =
        result.data.action === "updated"
          ? t("add.result.updated")
          : t("add.result.added")

      // 如果存在多个结果，则输出序号
      console.log(
        `${indexText}✅ ${styleText("green", result.name)}: ${actionText}`,
        "→",
        t("add.result.usage_label", {
          usage: styleText("green", result.usage),
        }),
      )
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
    console.log(
      `\n${t("add.result.written_to", { path: styleText(["underline", "green"], aliasesFile) })}`,
    )

    if (!existed) {
      console.log(t("add.result.sourced_to", { path: rcFile }))
    }

    console.log(`\n${styleText("bold", t("add.result.restart_terminal"))}`)
  }
}
