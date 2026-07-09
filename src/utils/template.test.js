import assert from "node:assert"
import { it } from "node:test"
import { listAvailableAliases } from "./template.js"

it("should do something", () => {
  const templates = listAvailableAliases()

  assert.deepStrictEqual(templates.length, 1)

  const allSourceNotEmpty = templates.every(
    (template) => template.source.trim().length > 0,
  )
  assert.ok(allSourceNotEmpty)

  // remove sources for test stability
  const allWithoutSources = templates.map(({ source, ...template }) => template)

  assert.deepStrictEqual(allWithoutSources, [
    {
      description: "快速打开 npm 包页",
      name: "pocket_open_npm",
    },
  ])
})
