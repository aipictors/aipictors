import { expect, test } from "bun:test"
import { render } from "@testing-library/react"
import type { FragmentOf } from "gql.tada"
import {
  UserHomeHeader,
  type UserHomeHeaderFragment,
} from "~/routes/($lang)._main.users.$user._index/components/user-home-header"

const toUser = (headerFrame: { slug: string } | null) =>
  ({
    id: "1",
    headerImageUrl: "https://example.com/header.webp",
    iconUrl: null,
    headerFrame,
  }) as unknown as FragmentOf<typeof UserHomeHeaderFragment>

test("ヘッダー枠は角丸で切り抜く画像の箱の外に重ね、アイコンをずらす印を付ける", () => {
  const { container } = render(
    <UserHomeHeader
      user={toUser({ slug: "gacha-sr-aurora" })}
      userIconView={null}
    />,
  )

  const root = container.firstElementChild as HTMLElement
  expect(root.hasAttribute("data-header-frame")).toBe(true)

  const frame = container.querySelector('img[src$="gacha-sr-aurora.sp.webp"]')
  expect(frame).not.toBeNull()
  // 枠は overflow-hidden（角丸）の箱の中に入れない
  expect(frame?.closest(".overflow-hidden")).toBeNull()
})

test("ヘッダー枠がない人には印を付けない", () => {
  const { container } = render(
    <UserHomeHeader user={toUser(null)} userIconView={null} />,
  )

  const root = container.firstElementChild as HTMLElement
  expect(root.hasAttribute("data-header-frame")).toBe(false)
})
