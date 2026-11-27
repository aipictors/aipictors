import { afterEach, beforeEach, expect, mock, test } from "bun:test"

type CreateWorkArgs = {
  variables: { input: { imageUrls: string[]; rating?: string } }
}

const toastMock = mock((_message: string) => {})
const createWork = mock(
  async (_args: CreateWorkArgs): Promise<unknown> => ({
    data: { createWork: { id: "new", uuid: "new-uuid" } },
  }),
)
const checkWorkByImageHash = mock(
  async (): Promise<{ data?: unknown; error?: Error }> => ({
    data: { workByImageHash: null },
  }),
)
const lazyQueryOptions: unknown[] = []

const sonner = await import("sonner")
mock.module("sonner", () => ({ ...sonner, toast: toastMock }))
const apolloClient = await import("@apollo/client/index")
mock.module("@apollo/client/index", () => ({
  ...apolloClient,
  useMutation: () => [createWork],
  useLazyQuery: (_query: unknown, options: unknown) => {
    lazyQueryOptions.push(options)
    return [checkWorkByImageHash]
  },
}))
const resizeModule = await import("~/utils/resize-image")
mock.module("~/utils/resize-image", () => ({
  ...resizeModule,
  resizeThumbnail: async () => ({
    base64: "data:image/webp;base64,AAAA",
    width: 1,
    height: 1,
  }),
  resizeImage: async () => ({
    base64: "data:image/jpeg;base64,AAAA",
    width: 1,
    height: 1,
  }),
}))
const sizeModule = await import("~/utils/get-size-from-base64")
mock.module("~/utils/get-size-from-base64", () => ({
  ...sizeModule,
  getSizeFromBase64: async () => ({ width: 1, height: 1 }),
}))
const draftModule = await import(
  "~/routes/($lang)._main.new.image/utils/post-image-draft"
)
mock.module("~/routes/($lang)._main.new.image/utils/post-image-draft", () => ({
  ...draftModule,
  clearPersistedPostDrafts: async () => {},
}))

let sensitiveCount = 0
/** 仕上げた後の items（null なら渡したまま） */
let finalizedItems: unknown[] | null = null
const autoMosaicModule = await import(
  "~/routes/($lang)._main.new.image/utils/post-auto-mosaic"
)
mock.module("~/routes/($lang)._main.new.image/utils/post-auto-mosaic", () => ({
  ...autoMosaicModule,
  countSensitivePostImages: async () => sensitiveCount,
  finalizePostMosaic: async (input: {
    items: { content: string | null }[]
    thumbnailBase64: string
    ogpBase64: string | null
  }) => ({
    contents: (finalizedItems ?? input.items).map(
      (item) => (item as { content: string | null }).content,
    ),
    items: finalizedItems ?? input.items,
    thumbnailBase64: input.thumbnailBase64,
    ogpBase64: input.ogpBase64,
    mosaicImageCount: 1,
    failedCount: 0,
    warningCount: 0,
  }),
}))
let confirmAnswers: boolean[] = []
const confirmMessages: string[] = []
const fakeConfirm = (message?: string) => {
  confirmMessages.push(message ?? "")
  return confirmAnswers.shift() ?? false
}
// 他のテストのファイルと同じ window を使うので、confirm だけ差し替えて戻す
const realWindow = Reflect.get(globalThis, "window") as
  | (Window & typeof globalThis)
  | undefined
const realConfirm = realWindow?.confirm
let ratingChangeCount = 0

const { usePostImageSubmit } = await import(
  "~/routes/($lang)._main.new.image/hooks/use-post-image-submit"
)

type Props = Parameters<typeof usePostImageSubmit>[0]
type Action = { type: string; payload?: unknown }

let actions: Action[] = []
let uploadCount = 0
let failUploadAt: number | null = null
const realFetch = globalThis.fetch
const realSetTimeout = globalThis.setTimeout
const realConsole = { log: console.log, error: console.error }

/** リトライの待ち時間を飛ばす */
const flushRetries = async () => {
  for (let i = 0; i < 200; i++) {
    await new Promise((resolve) => realSetTimeout(resolve, 0))
  }
}

const post = async (
  options: {
    confirmAutoMosaic?: (previews: string[]) => Promise<boolean>
  } = {},
) => {
  const isPostingRef = { current: false }
  const onPost = usePostImageSubmit({
    state: {
      items: [{ content: "data:image/png;base64,AAAA" }],
      ogpBase64: null,
      pngInfo: null,
      videoFile: null,
    },
    inputState: {
      tags: [],
      reservationDate: null,
      reservationTime: null,
      ratingRestriction: "G",
    },
    dispatch: (action: Action) => actions.push(action),
    mediaType: "image",
    events: [],
    formResult: {
      success: true,
      output: {
        title: "title",
        enTitle: "",
        caption: "",
        enCaption: "",
        thumbnailBase64: "data:image/png;base64,AAAA",
      },
    },
    token: "token",
    userId: "1",
    isNotLoggedIn: false,
    isPostingRef,
    t: (ja: string) => ja,
    onRatingChangeToR18: () => {
      ratingChangeCount += 1
    },
    confirmAutoMosaic: options.confirmAutoMosaic,
  } as unknown as Props)
  await onPost()
  await flushRetries()
  return isPostingRef
}

const doneActions = () =>
  actions.filter((action) => action.type === "MARK_AS_DONE")

beforeEach(() => {
  actions = []
  sensitiveCount = 0
  finalizedItems = null
  confirmAnswers = []
  confirmMessages.length = 0
  ratingChangeCount = 0
  if (realWindow) realWindow.confirm = fakeConfirm
  else
    globalThis.window = { confirm: fakeConfirm } as unknown as Window &
      typeof globalThis
  uploadCount = 0
  failUploadAt = null
  toastMock.mockClear()
  createWork.mockClear()
  createWork.mockImplementation(async () => ({
    data: { createWork: { id: "new", uuid: "new-uuid" } },
  }))
  checkWorkByImageHash.mockClear()
  checkWorkByImageHash.mockImplementation(async () => ({
    data: { workByImageHash: null },
  }))
  console.log = () => {}
  console.error = () => {}
  globalThis.setTimeout = ((handler: () => void, ms?: number) =>
    realSetTimeout(
      handler,
      ms === 45_000 ? ms : 0,
    )) as unknown as typeof setTimeout
  globalThis.fetch = (async () => {
    uploadCount += 1
    if (uploadCount === failUploadAt) {
      return Response.json(
        { error: "upload failed", data: null },
        { status: 500 },
      )
    }
    return Response.json({
      error: null,
      data: {
        fileId: `f${uploadCount}`,
        url: `https://images.test/${uploadCount}`,
      },
    })
  }) as unknown as typeof fetch
})

afterEach(() => {
  if (realWindow && realConfirm) realWindow.confirm = realConfirm
  else if (!realWindow) Reflect.deleteProperty(globalThis, "window")
  globalThis.fetch = realFetch
  globalThis.setTimeout = realSetTimeout
  console.log = realConsole.log
  console.error = realConsole.error
})

test("成功すると画像の URL を付けて作品を 1 回だけ作る", async () => {
  await post()

  expect(createWork).toHaveBeenCalledTimes(1)
  expect(createWork.mock.calls[0][0].variables.input.imageUrls).toEqual([
    "https://images.test/4",
  ])
  expect(doneActions()).toHaveLength(1)
})

test("どのアップロードで失敗しても createWork を送らず、失敗をそのまま出す", async () => {
  // サムネイル 2 枚・AI 評価用・本体の 4 回（OGP なし）
  for (const failAt of [1, 2, 3, 4]) {
    actions = []
    uploadCount = 0
    failUploadAt = failAt
    toastMock.mockClear()
    createWork.mockClear()

    const isPostingRef = await post()

    expect(createWork).not.toHaveBeenCalled()
    // アップロードは同時に始めるので、失敗しても 4 回とも送っている
    expect(uploadCount).toBe(4)
    expect(toastMock).toHaveBeenCalledWith("upload failed")
    expect(actions.at(-1)).toEqual({ type: "SET_PROGRESS", payload: 0 })
    expect(doneActions()).toHaveLength(0)
    expect(isPostingRef.current).toBe(false)
  }
})

test("createWork の失敗はアップロードし直さずリトライし、同じ URL を送る", async () => {
  createWork.mockImplementationOnce(async () => {
    throw new Error("network")
  })

  await post()

  expect(uploadCount).toBe(4)
  expect(createWork).toHaveBeenCalledTimes(2)
  expect(createWork.mock.calls[1][0].variables.input.imageUrls).toEqual([
    "https://images.test/4",
  ])
  expect(doneActions()).toHaveLength(1)
  expect(lazyQueryOptions.at(-1)).toEqual({ fetchPolicy: "network-only" })
})

test("前回の createWork で自分の作品ができていたらリトライで作らない", async () => {
  createWork.mockImplementationOnce(async () => {
    throw new Error("response lost")
  })
  checkWorkByImageHash.mockImplementation(async () => ({
    data: {
      workByImageHash: { id: "made", uuid: "made-uuid", user: { id: "1" } },
    },
  }))

  await post()

  expect(createWork).toHaveBeenCalledTimes(1)
  expect(doneActions()[0]?.payload).toEqual({
    uploadedWorkId: "made",
    uploadedWorkUuid: "made-uuid",
  })
})

test("作品の有無を確かめられないときは createWork を送らない", async () => {
  createWork.mockImplementationOnce(async () => {
    throw new Error("response lost")
  })
  checkWorkByImageHash.mockImplementation(async () => ({
    error: new Error("check failed"),
  }))

  const isPostingRef = await post()

  expect(createWork).toHaveBeenCalledTimes(1)
  expect(checkWorkByImageHash).toHaveBeenCalledTimes(3)
  expect(doneActions()).toHaveLength(0)
  expect(toastMock).toHaveBeenCalledWith("check failed")
  expect(isPostingRef.current).toBe(false)
})

test("同じハッシュが他人の作品なら投稿済みにせず、断られた理由を出す", async () => {
  createWork.mockImplementation(async () => {
    throw new Error("同じ画像が既に投稿されています")
  })
  checkWorkByImageHash.mockImplementation(async () => ({
    data: {
      workByImageHash: { id: "other", uuid: "other-uuid", user: { id: "2" } },
    },
  }))

  await post()

  expect(doneActions()).toHaveLength(0)
  expect(createWork).toHaveBeenCalledTimes(4)
  expect(toastMock).toHaveBeenCalledWith("同じ画像が既に投稿されています")
})

test("全年齢で性器が写っていて「R18 にする」を選ぶと、R18 にして投稿する", async () => {
  sensitiveCount = 1
  confirmAnswers = [true]
  await post()

  expect(confirmMessages).toHaveLength(1)
  expect(ratingChangeCount).toBe(1)
  expect(createWork).toHaveBeenCalledTimes(1)
  expect(createWork.mock.calls[0][0].variables.input.rating).toBe("R18")
})

test("全年齢で性器が写っていて、R18 にせず全年齢のままも選ばなければ投稿しない", async () => {
  sensitiveCount = 1
  confirmAnswers = [false, false]
  const isPostingRef = await post()

  expect(confirmMessages).toHaveLength(2)
  expect(createWork).not.toHaveBeenCalled()
  expect(isPostingRef.current).toBe(false)
})

test("全年齢のまま投稿するを選ぶと、全年齢で投稿する", async () => {
  sensitiveCount = 1
  confirmAnswers = [false, true]
  await post()

  expect(ratingChangeCount).toBe(0)
  expect(createWork.mock.calls[0][0].variables.input.rating).toBe("G")
})

test("性器が写っていなければ聞かずに全年齢で投稿する", async () => {
  await post()

  expect(confirmMessages).toHaveLength(0)
  expect(createWork.mock.calls[0][0].variables.input.rating).toBe("G")
})

const autoMosaicItem = {
  content: "data:image/webp;base64,MOSAIC",
  mosaic: {
    source: "data:image/png;base64,AAAA",
    mask: "data:image/png;base64,MASK",
    style: "mosaic",
    strength: 1,
    isAuto: true,
  },
}

test("自動でモザイクをかけた画像は投稿の前に見せ、「このまま投稿」でそのまま投稿する", async () => {
  sensitiveCount = 1
  confirmAnswers = [true]
  finalizedItems = [autoMosaicItem]
  const previews: string[][] = []
  await post({
    confirmAutoMosaic: async (images) => {
      previews.push(images)
      return true
    },
  })

  expect(previews).toEqual([["data:image/webp;base64,MOSAIC"]])
  expect(createWork).toHaveBeenCalledTimes(1)
  expect(doneActions()).toHaveLength(1)
})

test("自動モザイクの確認で「修正する」を選ぶと投稿せず、かけた画像を一覧に戻す", async () => {
  sensitiveCount = 1
  confirmAnswers = [true]
  finalizedItems = [autoMosaicItem]
  const isPostingRef = await post({ confirmAutoMosaic: async () => false })

  expect(createWork).toHaveBeenCalledTimes(0)
  expect(uploadCount).toBe(0)
  expect(doneActions()).toHaveLength(0)
  expect(isPostingRef.current).toBe(false)
  expect(actions.filter((action) => action.type === "REPLACE_ITEM")).toEqual([
    {
      type: "REPLACE_ITEM",
      payload: { from: "data:image/png;base64,AAAA", item: autoMosaicItem },
    },
  ])
})
