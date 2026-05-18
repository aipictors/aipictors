import { describe, expect, test } from "bun:test"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"

describe("normalizeGenerativeFileUrl", () => {
  test("generative thumbnail URL is normalized to canonical host and base path", () => {
    expect(
      normalizeGenerativeFileUrl(
        "https://generative.files.aipictors.com/1a8fa3b4-299d-1046-67e6-30e4cc6d4caa/thumbnail?token=token",
      ),
    ).toBe(
      "https://generative-files.aipictors.com/1a8fa3b4-299d-1046-67e6-30e4cc6d4caa",
    )
  })

  test("HTML-encoded quoted generative URL is sanitized and normalized", () => {
    expect(
      normalizeGenerativeFileUrl(
        '&quot;https://generative.files.aipictors.com&quot;/1a8fa3b4-299d-1046-67e6-30e4cc6d4caa/thumbnail?token=token',
      ),
    ).toBe(
      "https://generative-files.aipictors.com/1a8fa3b4-299d-1046-67e6-30e4cc6d4caa",
    )
  })

  test("non-generative URL is returned unchanged", () => {
    const url = "https://example.com/image.png"

    expect(normalizeGenerativeFileUrl(url)).toBe(url)
  })
})