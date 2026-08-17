// src/utils/lang.mjs
/**
 * 检测用户系统语言
 * @returns { 'zh' | (string & {}) }
 */
function detectLanguage() {
  // process.env.LANG: en_US.UTF-8
  // Intl.DateTimeFormat().resolvedOptions().locale: zh-CN
  // The above two may be different.
  const lang =
    process.env.LANG || Intl.DateTimeFormat().resolvedOptions().locale || ""

  // console.log('lang:', lang);
  // console.log('process.env.LANG:', process.env.LANG);
  // console.log('Intl.DateTimeFormat().resolvedOptions().locale:', Intl.DateTimeFormat().resolvedOptions().locale);
  if (/^zh/.test(lang)) {
    return "zh"
  }

  return lang
}

export function isChinese() {
  const lang = detectLanguage()
  // console.log('lang:', lang);
  return lang === "zh"
}
