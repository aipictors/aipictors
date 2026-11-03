import { afterEach, beforeEach, expect, mock, test } from "bun:test"

const toastMock = mock((_message: string) => {})
const createWork = mock(async (_args: { variables: { input: { mdUrl: string } } }) => ({
  data: { createWork: { id: "1", uuid: "uuid-1" } },
}))

const sonner = await import("sonner")
mock.module("sonner", () => ({ ...sonner, toast: toastMock }))
const apolloClient = await import("@apollo/client/index")
mock.module("@apollo/client/index", () => ({
  ...apolloClient,
  useMutation: () => [createWork],
}))
const resizeModule = await import("~/utils/resize-image")
mock.module("~/utils/resize-image", () => ({
  ...resizeModule,
  resizeThumbnail: async () => ({ base64: "data:image/webp;base64,AAAA", width: 1, height: 1 }),
  resizeImage: async () => ({ base64: "data:image/jpeg;base64,AAAA", width: 1, height: 1 }),
}))
const sizeModule = await import("~/utils/get-size-from-base64")
mock.module("~/utils/get-size-from-base64", () => ({
  ...sizeModule,
  getSizeFromBase64: async () => ({ width: 1, height: 1 }),
}))

const { usePostTextSubmit } = await import(
  "~/routes/($lang)._main.new.text/hooks/use-post-text-submit"
)

type Props = Parameters<typeof usePostTextSubmit>[0]

const validForm = {
  success: true,
  output: {
    title: "title",
    enTitle: "",
    caption: "",
    enCaption: "",
    thumbnailBase64: "data:image/png;base64,AAAA",
    md: "本文",
  },
} as unknown as Props["formResult"]

const invalidForm = {
  success: false,
  issues: [{ message: "本文を入力してください" }],
} as unknown as Props["formResult"]

const makeOnPost = (formResult: Props["formResult"], md = "本文") =>
  usePostTextSubmit({
    state: {
      items: [{ content: "data:image/png;base64,AAAA" }],
      ogpBase64: null,
      pngInfo: null,
    },
    inputState: {
      md,
      tags: [],
      reservationDate: null,
      reservationTime: null,
    },
    dispatch: () => {},
    events: [],
    formResult,
    token: "token",
    userId: "1",
    t: (ja: string) => ja,
  } as unknown as Props)

let textUploads: { fileId: string | null; body: string }[] = []
let failTextUpload = false
const realFetch = globalThis.fetch

beforeEach(() => {
  textUploads = []
  failTextUpload = false
  toastMock.mockClear()
  createWork.mockClear()
  globalThis.fetch = (async (input: string, init: RequestInit) => {
    const headers = init.headers as Record<string, string>
    const contentType = headers["Content-Type"]
    if (contentType === "text/markdown") {
      const fileId = new URL(input, "https://uploader.test").searchParams.get("fileid")
      textUploads.push({ fileId, body: await (init.body as Blob).text() })
      if (failTextUpload) {
        return new Response("{}", { status: 500 })
      }
      return Response.json({
        error: null,
        data: { fileId, url: `https://text-files.test/${fileId}` },
      })
    }
    return Response.json({
      error: null,
      data: { fileId: "image", url: "https://images.test/image" },
    })
  }) as unknown as typeof fetch
})

afterEach(() => {
  globalThis.fetch = realFetch
})

test("入力チェックで止まるときは本文をアップロードしない", async () => {
  await makeOnPost(invalidForm, "")()

  expect(textUploads).toEqual([])
  expect(createWork).not.toHaveBeenCalled()
  expect(toastMock).toHaveBeenCalledWith("本文を入力してください")
})

test("本文は 1 回だけ、投稿ごとに別のファイルへアップロードし、その URL で作品を作る", async () => {
  await makeOnPost(validForm, "一つ目")()
  await makeOnPost(validForm, "二つ目")()

  expect(textUploads.map((upload) => upload.body)).toEqual(["一つ目", "二つ目"])
  const [first, second] = textUploads.map((upload) => upload.fileId)
  expect(first).toMatch(/^[0-9a-f-]{36}$/)
  expect(second).not.toBe(first)
  expect(first).not.toBe("c09d45d7-c949-4515-b477-d1c17f1dd038")

  expect(createWork.mock.calls[0][0].variables.input.mdUrl).toBe(
    `https://text-files.test/${first}`,
  )
})

test("本文のアップロードに失敗したら作品を作らない", async () => {
  failTextUpload = true
  const consoleError = console.error
  console.error = () => {}

  await makeOnPost(validForm)()

  console.error = consoleError
  expect(createWork).not.toHaveBeenCalled()
  expect(toastMock).toHaveBeenCalledWith(
    "テキストファイルのアップロードに失敗いたしました",
  )
})
