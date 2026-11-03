import { expect, test } from "bun:test"
import { toJsonResponse } from "~/lib/server/json-response.server"

test("JSON にして、ステータスと no-store を付ける", async () => {
  const response = toJsonResponse({ error: "Unauthorized", data: null }, 401)
  expect(response.status).toBe(401)
  expect(response.headers.get("content-type")).toBe("application/json")
  expect(response.headers.get("cache-control")).toBe("no-store")
  expect(await response.json()).toEqual({ error: "Unauthorized", data: null })
})
