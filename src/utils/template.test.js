import assert from "node:assert"
import { it } from "node:test"
import { listAvailableAliases } from "./template.js"

it("should list all available alias templates", () => {
  const templates = listAvailableAliases()

  assert.ok(
    templates.length === 2,
    `Expected at least 2 templates, got ${templates.length}`,
  )

  const allSourceNotEmpty = templates.every(
    (template) => template.source.trim().length > 0,
  )
  assert.ok(allSourceNotEmpty)

  // remove sources for test stability
  const allWithoutSources = templates.map(({ source, ...template }) => template)

  assert.deepStrictEqual(allWithoutSources, [
    {
      name: "pnpm_init_node_js_pkg",
      description: "快速初始化 Node.js pnpm 项目",
    },
    {
      name: "pocket_open_npm",
      description: "快速打开 npm 包页",
    },
  ])
})
