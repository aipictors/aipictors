import { describe, expect, test } from "bun:test"
import { requestsHubTab } from "~/components/requests/requests-hub-nav"

describe("リクエストの上のタブ", () => {
  test("トップ・プランの詳細・依頼の入力は「探す」", () => {
    expect(requestsHubTab("/requests")).toBe("find")
    expect(requestsHubTab("/requests/")).toBe("find")
    expect(requestsHubTab("/requests/plans/abc")).toBe("find")
    expect(requestsHubTab("/requests/new")).toBe("find")
    expect(requestsHubTab("/requests/showcase")).toBe("find")
  })
  test("依頼の一覧と依頼の詳細は「依頼の管理」", () => {
    expect(requestsHubTab("/requests/manage")).toBe("manage")
    expect(requestsHubTab("/requests/123")).toBe("manage")
  })
  test("自分のプラン、規約はどれでもない", () => {
    expect(requestsHubTab("/requests/my-plans")).toBe("mine")
    expect(requestsHubTab("/requests/terms")).toBeNull()
  })
  test("/en・/r 付きでも同じ", () => {
    expect(requestsHubTab("/en/requests/manage")).toBe("manage")
    expect(requestsHubTab("/r/requests")).toBe("find")
    expect(requestsHubTab("/en/requests/my-plans")).toBe("mine")
  })
})
