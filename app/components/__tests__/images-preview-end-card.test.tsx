import { afterEach, expect, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { MemoryRouter } from "react-router-dom"
import { ImagesPreview } from "~/components/images-preview"

afterEach(cleanup)

const urls = ["https://example.com/1.png", "https://example.com/2.png"]

function Harness(props: { endCard?: React.ReactNode }) {
  const [index, setIndex] = useState(0)
  return (
    <MemoryRouter>
      <ImagesPreview
        isFixedHeight
        imageURLs={urls}
        thumbnailUrl={urls[index] ?? ""}
        currentIndex={index}
        setCurrentIndex={setIndex}
        endCard={props.endCard}
      />
      <span data-testid="index">{index}</span>
    </MemoryRouter>
  )
}

test("最後の画像の次は 1 枚目に戻さず、次の作品のカードを出す", () => {
  render(<Harness endCard={<a href="/posts/2">次の作品</a>} />)
  const next = screen.getByRole("button", { name: "次の画像" })
  fireEvent.click(next)
  expect(screen.getByTestId("index").textContent).toBe("1")
  expect(screen.queryByText("次の作品")).toBeNull()
  fireEvent.click(next)
  expect(screen.getByTestId("index").textContent).toBe("1")
  expect(screen.getByText("次の作品")).toBeTruthy()
  expect(screen.getByText("おわり")).toBeTruthy()
  // 前へで最後の画像に戻る
  fireEvent.click(screen.getByRole("button", { name: "前の画像" }))
  expect(screen.queryByText("次の作品")).toBeNull()
  expect(screen.getByTestId("index").textContent).toBe("1")
})

test("カードの「1 枚目から見る」で 1 枚目に戻る", () => {
  render(<Harness endCard={<p>カード</p>} />)
  const next = screen.getByRole("button", { name: "次の画像" })
  fireEvent.click(next)
  fireEvent.click(next)
  fireEvent.click(screen.getByRole("button", { name: "1 枚目から見る" }))
  expect(screen.getByTestId("index").textContent).toBe("0")
  expect(screen.queryByText("カード")).toBeNull()
})

test("カードを渡さなければ今までどおり 1 枚目に戻る", () => {
  render(<Harness />)
  const next = screen.getByRole("button", { name: "次の画像" })
  fireEvent.click(next)
  fireEvent.click(next)
  expect(screen.getByTestId("index").textContent).toBe("0")
})
