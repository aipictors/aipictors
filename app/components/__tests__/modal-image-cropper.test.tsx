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
