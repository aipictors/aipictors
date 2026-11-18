import { describe, expect, test } from "bun:test"
import { toAlbumsRating } from "~/routes/($lang).albums._index/albums-rating"

describe("toAlbumsRating", () => {
  test("指定がなければ全年齢（G）だけにする", () => {
    expect(toAlbumsRating(null)).toBe("G")
    expect(toAlbumsRating("")).toBe("G")
    expect(toAlbumsRating("unknown")).toBe("G")
  })

  test("指定した年齢制限で絞る", () => {
    expect(toAlbumsRating("G")).toBe("G")
    expect(toAlbumsRating("R15")).toBe("R15")
    expect(toAlbumsRating("R18")).toBe("R18")
    expect(toAlbumsRating("R18G")).toBe("R18G")
  })

  test("rating=ALL はすべての年齢制限", () => {
    expect(toAlbumsRating("ALL")).toBeNull()
  })
})
