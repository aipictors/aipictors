import { describe, expect, test } from "bun:test"
import {
  applyGeneratedContentToPostForm,
  pickGeneratedTagsToAdd,
} from "~/routes/($lang)._main.new.image/utils/post-form-generated-content"
import type { PostImageFormInputAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-input-action"

const tagsOf = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: String(i), text: `tag${i}` }))

describe("pickGeneratedTagsToAdd", () => {
  test("前後の空白を取り、空のものと今あるものは除く", () => {
    expect(
      pickGeneratedTagsToAdd({
        tags: [" a ", "", "  ", "TAG0"],
        currentTags: tagsOf(1),
      }),
    ).toEqual({ tags: ["a"], isLimitReached: false })
  })

  test("10 個までで止める", () => {
    expect(
      pickGeneratedTagsToAdd({ tags: ["a", "b", "c"], currentTags: tagsOf(8) }),
    ).toEqual({ tags: ["a", "b"], isLimitReached: true })
  })

  test("ちょうど 10 個になったときも上限に達した扱いになる", () => {
    expect(
      pickGeneratedTagsToAdd({ tags: ["a"], currentTags: tagsOf(9) }),
    ).toEqual({ tags: ["a"], isLimitReached: true })
  })
})

describe("applyGeneratedContentToPostForm", () => {
  test("日本語・英語の順に入れて、空のものは入れない", () => {
    const actions: PostImageFormInputAction[] = []
    applyGeneratedContentToPostForm({
      data: {
        title: "題",
        titleEn: "  ",
        description: "説明",
        descriptionEn: "desc",
        tags: ["日本語"],
        tagsEn: ["english"],
      },
      tags: [],
      dispatchInput: (action) => actions.push(action),
    })
    expect(actions.map((action) => action.type)).toEqual([
      "SET_TITLE",
      "SET_CAPTION",
      "SET_EN_CAPTION",
      "ADD_TAG",
      "ADD_TAG",
    ])
  })
})
