/**
 * 简单行级 diff 工具
 */

/**
 * 对两段文本做行级 diff，返回 +/- 格式
 * @param {string} oldText
 * @param {string} newText
 * @returns {{ hasDiff: boolean, lines: string[] }}
 */
export function simpleDiff(oldText, newText) {
  if (oldText === newText) {
    return { hasDiff: false, lines: [] }
  }

  const oldLines = oldText.split("\n")
  const newLines = newText.split("\n")

  const maxLen = Math.max(oldLines.length, newLines.length)
  /** @type {string[]} */
  const diffLines = []
  let diffCount = 0

  for (let i = 0; i < maxLen; i++) {
    if (diffCount >= 3) break

    const oldLine = oldLines[i]
    const newLine = newLines[i]

    if (oldLine !== newLine) {
      if (oldLine !== undefined) {
        diffLines.push(`- ${oldLine}`)
      }
      if (newLine !== undefined) {
        diffLines.push(`+ ${newLine}`)
      }
      diffCount++
    }
  }

  return { hasDiff: true, lines: diffLines }
}
