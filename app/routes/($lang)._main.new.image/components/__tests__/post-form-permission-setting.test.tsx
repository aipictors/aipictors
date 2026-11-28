import { afterEach, expect, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { PostFormPermissionSetting } from "../post-form-permission-setting"

afterEach(() => {
  cleanup()
})

const renderSetting = (props: {
  isTagEditable: boolean
  isCommentsEditable: boolean
}) => {
  const tagChanges: boolean[] = []
  const commentChanges: boolean[] = []
  render(
    <MemoryRouter>
      <PostFormPermissionSetting
        isTagEditableChecked={props.isTagEditable}
        onTagEditableChange={(value) => tagChanges.push(value)}
        isCommentsEditableChecked={props.isCommentsEditable}
        onCommentsEditableChange={(value) => commentChanges.push(value)}
      />
    </MemoryRouter>,
  )
  return { tagChanges, commentChanges }
}

test("「タグの編集を許可しない」はコメントの設定に関係なくタグの編集を止める", () => {
  // コメントを許可しない作品でも、タグの設定はタグの今の値から切り替える
  const { tagChanges, commentChanges } = renderSetting({
    isTagEditable: true,
    isCommentsEditable: false,
  })

  fireEvent.click(
    screen.getByRole("checkbox", { name: "タグの編集を許可しない" }),
  )

  expect(tagChanges).toEqual([false])
  expect(commentChanges).toEqual([])
})

test("「タグの編集を許可しない」を外すとタグの編集を許可する", () => {
  const { tagChanges } = renderSetting({
    isTagEditable: false,
    isCommentsEditable: true,
  })

  fireEvent.click(
    screen.getByRole("checkbox", { name: "タグの編集を許可しない" }),
  )

  expect(tagChanges).toEqual([true])
})

test("「コメントを許可しない」はコメントの設定だけを切り替える", () => {
  const { tagChanges, commentChanges } = renderSetting({
    isTagEditable: true,
    isCommentsEditable: true,
  })

  fireEvent.click(
    screen.getByRole("checkbox", { name: "コメントを許可しない" }),
  )

  expect(commentChanges).toEqual([false])
  expect(tagChanges).toEqual([])
})
