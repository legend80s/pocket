import { after, before } from "node:test"

const lang = process.env.LANG

// https://nodejs.org/docs/latest/api/test.html#global-setup-and-teardown
// `--test-global-setup` flag is supported in Node.js >=24 only.
export function testGlobalSetup() {
  before(() => {
    // console.log("before")
    // Set the language to Chinese for stable testing in all environments.
    process.env.LANG = `zh_CN.UTF-8`
  })

  after(() => {
    // console.log("after")
    // Reset the language to the default value.
    process.env.LANG = lang
  })
}
