import { beforeEach, describe, expect, test } from "bun:test"
import {
  createInitialPostImageFormInputState,
  hasPersistablePostInput,
  hasPersistablePostMedia,
  INITIAL_POST_IMAGE_FORM_MEDIA_STATE,
  loadBotSettings,
  loadPostFormDraft,
  normalizeBotGradingType,
  normalizeBotPersonality,
  normalizeDate,
  normalizeNumberArray,
  normalizeTags,
  POST_IMAGE_FORM_DRAFT_STORAGE_KEY,
  removePostFormDraft,
  saveBotSettings,
  savePostFormDraft,
} from "~/routes/($lang)._main.new.image/utils/post-image-draft"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"

beforeEach(() => {
  window.localStorage.clear()
})

describe("下書きの値を整える", () => {
  test("壊れた日付は今の日時にする", () => {
    expect(normalizeDate("2026-01-02T00:00:00.000Z").toISOString()).toBe(
      "2026-01-02T00:00:00.000Z",
    )
    expect(Number.isNaN(normalizeDate("broken").getTime())).toBe(false)
  })

  test("配列でなければ空にして、正しいものだけ残す", () => {
    expect(normalizeTags("x")).toEqual([])
    expect(normalizeTags([{ id: "1", text: "a" }, { id: 2 }])).toEqual([
      { id: "1", text: "a" },
    ])
    expect(normalizeNumberArray([1, "2", Number.NaN, 3])).toEqual([1, 3])
  })

  test("AI 評価の設定は知らない値なら既定にする", () => {
    expect(normalizeBotPersonality("robot")).toBe("robot")
    expect(normalizeBotPersonality("cat")).toBe("pictor_chan")
    expect(normalizeBotGradingType("SCORE_ONLY")).toBe("SCORE_ONLY")
    expect(normalizeBotGradingType(1)).toBe("COMMENT_AND_SCORE")
  })
})

describe("入力の下書き", () => {
  test("保存したものを読める", () => {
    savePostFormDraft({ title: "題", tags: [{ id: "1", text: "a" }] })
    const draft = loadPostFormDraft()
    expect(draft?.type).toBe("INITIALIZE")
    expect(draft?.payload.title).toBe("題")
    expect(draft?.payload.tags).toEqual([{ id: "1", text: "a" }])
    // 入っていない項目は既定の値
    expect(draft?.payload.accessType).toBe("PUBLIC")
    expect(draft?.payload.aiModelId).toBe("1")
    expect(draft?.payload.useCommentFeature).toBe(true)
  })

  test("なければ null、消すと読めなくなる", () => {
    expect(loadPostFormDraft()).toBeNull()
    savePostFormDraft({ title: "題" })
    removePostFormDraft()
    expect(loadPostFormDraft()).toBeNull()
  })

  test("壊れた下書きは消す", () => {
    for (const value of ["{", "1", "null"]) {
      window.localStorage.setItem(POST_IMAGE_FORM_DRAFT_STORAGE_KEY, value)
      expect(loadPostFormDraft()).toBeNull()
      expect(
        window.localStorage.getItem(POST_IMAGE_FORM_DRAFT_STORAGE_KEY),
      ).toBeNull()
    }
  })
})

describe("AI 評価の設定", () => {
  test("保存したものを読める", () => {
    const settings = {
      isBotGradingEnabled: false,
      isBotGradingPublic: true,
      isBotGradingRankingEnabled: false,
      botPersonality: "sage",
      botGradingType: "SCORE_ONLY",
    }
    expect(loadBotSettings()).toBeNull()
    saveBotSettings(settings)
    expect(loadBotSettings()).toEqual(settings)
  })
})

describe("下書きとして残すものがあるか", () => {
  const emptyInput = createInitialPostImageFormInputState() as PostImageFormInputState

  test("初期の入力は残さない", () => {
    expect(hasPersistablePostInput(emptyInput)).toBe(false)
  })

  test("入力や設定を変えたら残す", () => {
    expect(hasPersistablePostInput({ ...emptyInput, title: "題" })).toBe(true)
    expect(hasPersistablePostInput({ ...emptyInput, title: "  " })).toBe(false)
    expect(
      hasPersistablePostInput({ ...emptyInput, ratingRestriction: "R18" }),
    ).toBe(true)
    expect(
      hasPersistablePostInput({ ...emptyInput, useTagFeature: false }),
    ).toBe(true)
    expect(
      hasPersistablePostInput({ ...emptyInput, correctionMessage: "直した" }),
    ).toBe(true)
  })

  test("画像を選んだら残す", () => {
    const emptyMedia: PostImageFormState = {
      ...INITIAL_POST_IMAGE_FORM_MEDIA_STATE,
      editTargetImageBase64: null,
      isDrawing: false,
      isHovered: false,
      isOpenImageGenerationDialog: false,
      isOpenLoadingAi: false,
      progress: 0,
      selectedImageGenerationIds: [],
      uploadedWorkId: null,
      uploadedWorkUuid: null,
      videoFile: null,
      videoDurationSeconds: null,
    }
    expect(hasPersistablePostMedia(emptyMedia)).toBe(false)
    expect(
      hasPersistablePostMedia({ ...emptyMedia, thumbnailPosX: 1 }),
    ).toBe(true)
    expect(
      hasPersistablePostMedia({
        ...emptyMedia,
        items: [{ id: 1, content: "a" }],
      }),
    ).toBe(true)
  })
})
