// src/utils/lang.mjs
/**
 * 检测用户系统语言
 * @returns { 'zh' | 'non-zh' }
 */
export function detectLanguage() {
  // process.env.LANG: zh_CN.UTF-8
  // Intl.DateTimeFormat().resolvedOptions().locale: zh-CN
  const lang =
    process.env.LANG || Intl.DateTimeFormat().resolvedOptions().locale || ""

  if (/^zh/.test(lang)) {
    return "zh"
  }

  return "non-zh"
}
