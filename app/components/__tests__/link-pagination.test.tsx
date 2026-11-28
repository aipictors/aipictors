import { afterEach, expect, test } from "bun:test"
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { buildPageItems, LinkPagination } from "~/components/link-pagination"

afterEach(cleanup)

test("先頭・末尾と現在の前後を出し、離れていれば省略する", () => {
  expect(buildPageItems(5, 19, 2)).toEqual([0, "gap", 3, 4, 5, 6, 7, "gap", 19])
  expect(buildPageItems(5, 19, 1)).toEqual([0, "gap", 4, 5, 6, "gap", 19])
  expect(buildPageItems(0, 3, 1)).toEqual([0, 1, "gap", 3])
})

test("「前へ」「次へ」の文字はスマホでも隠さない", () => {
  render(
    <MemoryRouter>
      <LinkPagination
        currentPage={3}
        totalCount={200}
        perPage={10}
        toHref={(page) => `/tags/a?page=${page}`}
      />
    </MemoryRouter>,
  )
  const next = screen.getByRole("link", { name: "次へ" })
  const prev = screen.getByRole("link", { name: "前へ" })
  expect(next.getAttribute("href")).toBe("/tags/a?page=4")
  expect(prev.getAttribute("href")).toBe("/tags/a?page=2")
  for (const link of [next, prev]) {
    const label = Array.from(link.querySelectorAll("span")).find(
      (span) => span.textContent === link.getAttribute("aria-label"),
    )
    expect(label?.className ?? "").not.toContain("hidden")
    expect(link.className).toContain("h-11")
  }
})
