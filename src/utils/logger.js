/** @import { ILogger } from './logger.type.js' */

/**
 * @implements {ILogger}
 */
export class Logger {
  /**
   *
   * @param {boolean} debugging
   */
  constructor(debugging) {
    this.debugging = debugging
  }
  /**
   * for debugging purposes
   * @param {...unknown} args
   * @returns
   */
  debug = (...args) => {
    if (this.debugging) {
      console.log(`[DEBUG ${new Date().toLocaleString()}]`, ...args)
    }
  }
}

if (import.meta.main) {
  const debugging = false
  const { debug } = new Logger(debugging)

  debug("Running in main thread")
}
