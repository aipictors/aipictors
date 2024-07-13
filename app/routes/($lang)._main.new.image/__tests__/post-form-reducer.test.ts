import {
  initialState,
  postFormReducer,
} from "@/routes/($lang)._main.new.image/_types/post-form-reducer"
import { test, expect, describe } from "bun:test"

describe("SET_RESERVATION_DATE", () => {
  test("日付を変えるとお題がNULLになる", () => {
    const state = {
      ...initialState,
      themeId: "1",
    }

    const action = {
      type: "SET_RESERVATION_DATE",
      payload: "2022-01-01",
    } as const

    const newState = postFormReducer(state, action)

    expect(newState.themeId).toBe(null)
  })
})

describe("SET_THEME_ID", () => {
  test("テーマを空にするとタグが削除される", () => {
    const state = {
      ...initialState,
      themeId: "1",
      tags: [{ id: "9999", text: "THEME" }],
    }

    const action = {
      type: "SET_THEME_ID",
      payload: {
        themeId: null,
        themeTitle: "THEME",
      },
    } as const

    const newState = postFormReducer(state, action)

    expect(newState.tags.length).toBe(0)
  })

  test("テーマを設定にするとタグが追加される", () => {
    const state = {
      ...initialState,
      themeId: "1",
      tags: [],
    }

    const action = {
      type: "SET_THEME_ID",
      payload: {
        themeId: "1",
        themeTitle: "THEME",
      },
    } as const

    const newState = postFormReducer(state, action)

    expect(newState.tags.length).toBe(1)
  })
})
