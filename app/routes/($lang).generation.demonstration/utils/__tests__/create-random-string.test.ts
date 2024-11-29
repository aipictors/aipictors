import { createRandomString } from "~/routes/($lang).generation.demonstration/utils/create-random-string"
import { describe, expect, test } from "bun:test"

describe("createRandomString", () => {
  test("should return a random string of the specified length", () => {
    const count = 10
    const randomString = createRandomString(count)
    expect(randomString.length).toBe(count)
  })

  test("should only contain characters from the specified character set", () => {
    const count = 10
    const randomString = createRandomString(count)
    const characters =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789"
    for (let i = 0; i < randomString.length; i++) {
      expect(characters.includes(randomString.charAt(i))).toBe(true)
    }
  })
})
