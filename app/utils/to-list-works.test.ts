import { toListWorks } from "./to-list-works"

test("一覧に要らない重い項目だけを外す", () => {
  const [work] = toListWorks([
    {
      id: "1",
      title: "t",
      pngInfo: "x".repeat(1000),
      prompt: "p",
      user: { id: "u", name: "n", biography: "b", iconUrl: "i" },
    },
  ])
  expect(work).toEqual({
    id: "1",
    title: "t",
    user: { id: "u", name: "n", iconUrl: "i" },
  })
})

test("配列でなければ空にする", () => {
  expect(toListWorks(null)).toEqual([])
})
