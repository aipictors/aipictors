import { describe, expect, test } from "bun:test"
import { removeEdgeInjectedHeadTags } from "~/utils/edge-injected-head-tags"

describe("removeEdgeInjectedHeadTags", () => {
  test("<head> の agent: の meta だけを外す", () => {
    const removed: string[] = []
    const tags = ["agent:instructions", "agent:endpoint"].map((name) => ({
      remove: () => removed.push(name),
    }))
    let selector = ""
    const doc = {
      querySelectorAll: (value: string) => {
        selector = value
        return tags as unknown as NodeListOf<Element>
      },
    }
    expect(removeEdgeInjectedHeadTags(doc)).toBe(2)
    expect(removed).toEqual(["agent:instructions", "agent:endpoint"])
    expect(selector).toBe('head > meta[name^="agent:"]')
  })
})
