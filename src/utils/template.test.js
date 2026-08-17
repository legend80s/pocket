import assert from "node:assert"
import { after, before, it } from "node:test"
import { listAvailableAliases } from "./template.js"

const lang = process.env.LANG

before(() => {
  // Set the language to Chinese for stable testing in all environments.
  process.env.LANG = `zh_CN.UTF-8`
})

after(() => {
  // Reset the language to the default value.
  process.env.LANG = lang
})

it("should list all available alias templates", () => {
  const templates = listAvailableAliases()

  assert.ok(
    templates.length >= 2,
    `Expected at least 2 templates, got ${templates.length}`,
  )

  const allSourceNotEmpty = templates.every(
    (template) => template.source.trim().length > 0,
  )
  assert.ok(allSourceNotEmpty)

  // remove sources for test stability
  const allWithoutSources = templates
    .filter((item) =>
      ["fish_open_npm", "fish_pnpm_init_node_js_pkg"].includes(item.name),
    )
    .map(({ source, ...template }) => template)

  assert.deepStrictEqual(allWithoutSources, [
    {
      name: "fish_open_npm",
      description: "快速打开 npm 包页",
      usage: "fish_open_npm [--site=npmx] [包名]",
    },
    {
      name: "fish_pnpm_init_node_js_pkg",
      description: "快速初始化 Node.js pnpm 项目",
      usage: "fish_pnpm_init_node_js_pkg [文件夹名]",
    },
  ])
})
