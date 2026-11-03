import { afterEach, beforeEach, expect, test } from "bun:test"
import { act, cleanup, render, screen } from "@testing-library/react"
import { useProgressiveCount } from "~/routes/($lang)._main.posts.$post._index/hooks/use-progressive-count"

type Callback = (entries: { isIntersecting: boolean }[]) => void

let observers: { callback: Callback; disconnected: boolean }[] = []
const original = globalThis.IntersectionObserver

beforeEach(() => {
  observers = []
  globalThis.IntersectionObserver = class {
    entry: { callback: Callback; disconnected: boolean }
    constructor(callback: Callback) {
      this.entry = { callback, disconnected: false }
      observers.push(this.entry)
    }
    observe() {}
    disconnect() {
      this.entry.disconnected = true
    }
  } as unknown as typeof IntersectionObserver
})

afterEach(() => {
  cleanup()
  globalThis.IntersectionObserver = original
})

function List(props: { total: number; workId?: string }) {
  const { count, sentinelRef } = useProgressiveCount(
    props.total,
    8,
    props.workId ?? "1",
  )
  return (
    <>
      <p data-testid="count">{Math.min(count, props.total)}</p>
      {count < props.total && <div ref={sentinelRef} />}
    </>
  )
}

const shown = () => screen.getByTestId("count").textContent
const reachEnd = () =>
  act(() => {
    observers
      .filter((observer) => !observer.disconnected)
      .at(-1)
      ?.callback([{ isIntersecting: true }])
  })

test("末尾が近づくたびに 20 件ずつ増え、全件で見張りをやめる", () => {
  render(<List total={40} />)
  expect(shown()).toBe("8")
  reachEnd()
  expect(shown()).toBe("28")
  reachEnd()
  expect(shown()).toBe("40")
  expect(observers.every((observer) => observer.disconnected)).toBe(true)
})

test("末尾が見えていないときは増えない", () => {
  render(<List total={40} />)
  act(() => observers.at(-1)?.callback([{ isIntersecting: false }]))
  expect(shown()).toBe("8")
})

test("初期表示で足りるときは見張らない", () => {
  render(<List total={5} />)
  expect(observers).toHaveLength(0)
})

test("別の作品に移ると最初の数に戻る", () => {
  const { rerender } = render(<List total={40} workId="1" />)
  reachEnd()
  expect(shown()).toBe("28")
  rerender(<List total={40} workId="2" />)
  expect(shown()).toBe("8")
})
