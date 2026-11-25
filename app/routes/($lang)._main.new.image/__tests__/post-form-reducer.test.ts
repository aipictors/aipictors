import { describe, expect, test } from "bun:test"
import { postImageFormInputReducer } from "~/routes/($lang)._main.new.image/reducers/post-image-form-input-reducer"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import { toJstDateString } from "~/utils/post-reservation-theme"

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
  useTagFeature: true,
  useCommentFeature: true,
  usePromotionFeature: false,
  ratingRestriction: "G",
  accessType: "PUBLIC",
  generationParamAccessType: "PUBLIC",
  imageStyle: "ILLUSTRATION",
  aiModelId: "1",
  reservationDate: null,
  reservationTime: null,
  useGenerationParams: true,
  correctionMessage: "",
  isBotGradingEnabled: true,
  isBotGradingPublic: false,
  isBotGradingRankingEnabled: true,
  botPersonality: "pictor_chan",
  botGradingType: "COMMENT_AND_SCORE",
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

  test("今日の日付を入れただけならお題の選択が残る", () => {
    const state = {
      ...initialState,
      themeId: "1",
    }

    const action = {
      type: "SET_RESERVATION_DATE",
      payload: toJstDateString(),
    } as const

    const newState = postImageFormInputReducer(state, action)

    expect(newState.themeId).toBe("1")
    expect(newState.reservationDate).toBe(toJstDateString())
  })

  test("同じ日付を選び直してもお題の選択が残る", () => {
    const state = {
      ...initialState,
      themeId: "1",
      reservationDate: "2222-01-01",
    }

    const action = {
      type: "SET_RESERVATION_DATE",
      payload: "2222-01-01",
    } as const

    const newState = postImageFormInputReducer(state, action)

    expect(newState.themeId).toBe("1")
  })

  test("今日を選んだあとに予約を消してもお題の選択が残る", () => {
    const state = {
      ...initialState,
      themeId: "1",
      reservationDate: toJstDateString(),
    }

    const action = {
      type: "SET_RESERVATION_DATE",
      payload: null,
    } as const

    const newState = postImageFormInputReducer(state, action)

    expect(newState.themeId).toBe("1")
    expect(newState.reservationDate).toBe(null)
  })

  test("別の日の予約を消すとお題の選択が外れる", () => {
    const state = {
      ...initialState,
      themeId: "1",
      reservationDate: "2222-01-01",
    }

    const action = {
      type: "SET_RESERVATION_DATE",
      payload: null,
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

describe("ADD_TAG", () => {
  test("同じテキストのタグは重複して追加されない", () => {
    const state = {
      ...initialState,
      tags: [{ id: "tag-1", text: "美味しい料理祭-4a476e7f" }],
    }

    const action = {
      type: "ADD_TAG",
      payload: {
        id: "tag-2",
        text: "美味しい料理祭-4a476e7f",
      },
    } as const

    const newState = postImageFormInputReducer(state, action)

    expect(newState.tags).toHaveLength(1)
    expect(newState.tags[0].text).toBe("美味しい料理祭-4a476e7f")
  })
})
