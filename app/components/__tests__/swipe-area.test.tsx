import { expect, test } from "bun:test"
import { fireEvent, render } from "@testing-library/react"
import { SwipeArea } from "~/components/swipe-area"

const touch = (x: number, y: number) => ({ clientX: x, clientY: y })

const setup = () => {
  const calls: string[] = []
  const view = render(
    <SwipeArea
      onPrev={() => calls.push("prev")}
      onNext={() => calls.push("next")}
    >
      <div data-testid="content">画像</div>
    </SwipeArea>,
  )
  const area = view.getByTestId("content").parentElement as HTMLElement
  return { calls, area }
}

test("横に大きく動かすと前後に移る", () => {
  const { calls, area } = setup()

  fireEvent.touchStart(area, { touches: [touch(200, 300)] })
  fireEvent.touchEnd(area, { changedTouches: [touch(100, 310)] })

  expect(calls).toEqual(["next"])
})

test("縦に動かしたときは前後に移らない（スクロールのため）", () => {
  const { calls, area } = setup()

  fireEvent.touchStart(area, { touches: [touch(200, 500)] })
  fireEvent.touchEnd(area, { changedTouches: [touch(140, 100)] })

  expect(calls).toEqual([])
})

test("画像の上でも縦スクロールできる", () => {
  const { area } = setup()

  expect(area.style.touchAction).toBe("pan-y")
})
