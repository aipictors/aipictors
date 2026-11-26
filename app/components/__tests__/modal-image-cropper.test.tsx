import { expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ImageCropperModal } from "~/components/modal-image-cropper"

const setup = () => {
  const closed: string[] = []
  render(
    <ImageCropperModal
      src="https://example.com/a.png"
      isOpen={true}
      cropWidth={400}
      cropHeight={400}
      onCrop={() => {}}
      onClose={() => closed.push("close")}
    />,
  )
  return closed
}

test("右上の「✕」で閉じる", async () => {
  const closed = setup()

  const user = userEvent.setup()
  await user.click(screen.getByRole("button", { name: "Close" }))

  expect(closed).toEqual(["close"])
})

test("キャンセルでも閉じる", async () => {
  const closed = setup()

  const user = userEvent.setup()
  await user.click(screen.getByRole("button", { name: "キャンセル" }))

  expect(closed).toEqual(["close"])
})

test("比率を選べるときは比率のボタンを出し、押した比率を選んだ状態にする", async () => {
  render(
    <ImageCropperModal
      src="https://example.com/a.png"
      isOpen={true}
      cropWidth={800}
      cropHeight={600}
      aspectOptions={[
        { label: "元の比率", aspect: 4 / 3 },
        { label: "正方形", aspect: 1 },
      ]}
      isKeepCroppedSize
      title="カバー画像をズームして切り抜く"
      onCrop={() => {}}
      onClose={() => {}}
    />,
  )

  expect(screen.getByText("カバー画像をズームして切り抜く")).toBeTruthy()
  const original = screen.getByRole("button", { name: "元の比率" })
  const square = screen.getByRole("button", { name: "正方形" })
  expect(original.getAttribute("aria-pressed")).toBe("true")
  expect(square.getAttribute("aria-pressed")).toBe("false")

  const user = userEvent.setup()
  await user.click(square)

  expect(square.getAttribute("aria-pressed")).toBe("true")
  expect(original.getAttribute("aria-pressed")).toBe("false")
})

test("比率を選べないときは比率のボタンを出さない", () => {
  setup()
  expect(screen.queryByRole("button", { name: "元の比率" })).toBeNull()
})
