import { postImageFormInputReducer } from "@/routes/($lang)._main.new.image/reducers/post-image-form-input-reducer"
import type { PostImageFormInputState } from "@/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import { test, expect, describe } from "bun:test"

const initialState: PostImageFormInputState = {
  imageInformation: null,
  date: new Date(),
  title: "",
  enTitle: "",
  caption: "",
  enCaption: "",
  themeId: null,
  albumId: null,
  link: "",
  tags: [],
  useTagFeature: false,
  useCommentFeature: false,
  usePromotionFeature: false,
  ratingRestriction: "G",
  accessType: "PUBLIC",
  imageStyle: "ILLUSTRATION",
  aiModelId: "1",
  reservationDate: null,
  reservationTime: null,
  useGenerationParams: true,
}

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

    const newState = postImageFormInputReducer(state, action)

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

    const newState = postImageFormInputReducer(state, action)

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

    const newState = postImageFormInputReducer(state, action)

    expect(newState.tags.length).toBe(1)
  })
})
