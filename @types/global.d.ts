/**
 * ref:{@link https://github.com/oven-sh/bun/issues/4376#issuecomment-1712816919}
 */
declare global {
  const test: typeof import("bun:test")["test"]
  const describe: typeof import("bun:test")["describe"]
  const expect: typeof import("bun:test")["expect"]
  const it: typeof import("bun:test")["it"]
  const jest: typeof import("bun:test")["jest"]
  const mock: typeof import("bun:test")["mock"]
  const afterAll: typeof import("bun:test")["afterAll"]
  const beforeAll: typeof import("bun:test")["beforeAll"]
  const afterEach: typeof import("bun:test")["afterEach"]
  const beforeEach: typeof import("bun:test")["beforeEach"]
}
export type {}
