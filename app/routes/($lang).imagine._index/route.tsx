import { useEffect, useState, useCallback } from "react"
import { jwtDecode } from "jwt-decode"
import { useFetcher, useLoaderData } from "@remix-run/react"
import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/cloudflare"
import { getUserToken } from "~/utils/get-user-token"
import { setUserToken } from "~/utils/set-user-token"
import { useImagineContext } from "~/routes/($lang).imagine._index/hooks/use-imagine-context"
import { graphql } from "gql.tada"
import type { MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { useQuery } from "@apollo/client/index"
import { ImagineHeader } from "./components/mobile/imagine-header"
import { ImagineHistoryList } from "./components/mobile/imagine-history-list"
import { ImagineFooterForm } from "./components/mobile/imagine-footer-form"

// 実際のAPI型を使用
export type ImageGenerationTask = {
  id: string
  nanoid: string | null
  prompt: string
  negativePrompt?: string
  imageUrl?: string | null
  thumbnailUrl?: string | null
  status: string
  completedAt?: string | null
  model?: {
    id: string
    name: string
  }
  seed?: number
  steps?: number
  scale?: number
  sampler?: string
  sizeType?: string
  rating?: number
  isProtected?: boolean
}

type LoaderData = {
  imageGenerationTasks: ImageGenerationTask[]
  nextCursor: string | null
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const cursor = url.searchParams.get("cursor")
  const limit = Number(url.searchParams.get("limit") ?? 20)

  // TODO: 実際のGraphQL APIを呼び出す
  // 現在は模擬データを返す
  const mockTasks: ImageGenerationTask[] = Array.from(
    { length: limit },
    (_, i) => ({
      id: `task-${cursor || 0}-${i}`,
      nanoid: `nanoid-${cursor || 0}-${i}`,
      prompt: `Beautiful anime girl with blue hair and school uniform, high quality, detailed artwork${cursor ? ` (page ${cursor})` : ""}`,
      negativePrompt: "bad quality, blurry",
      imageUrl:
        "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/dw_openpose_full.webp",
      thumbnailUrl:
        "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/dw_openpose_full.webp",
      status: "DONE",
      completedAt: new Date(Date.now() - i * 3600000).toISOString(),
      model: {
        id: "model-1",
        name: "AnimeModel v1.0",
      },
      seed: Math.floor(Math.random() * 1000000),
      steps: 20,
      scale: 7.5,
      sampler: "DPM++ 2M Karras",
      sizeType: "512x768",
      rating: Math.floor(Math.random() * 6),
      isProtected: Math.random() > 0.7,
    }),
  )

  const nextCursor = cursor ? String(Number(cursor) + 1) : "1"

  return json<LoaderData>({
    imageGenerationTasks: mockTasks,
    nextCursor: mockTasks.length === limit ? nextCursor : null,
  })
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const prompt = formData.get("prompt") as string
  const negativePrompt = formData.get("negativePrompt") as string

  // TODO: 実際の画像生成APIを呼び出す
  // 現在は模擬レスポンスを返す
  const newTask: ImageGenerationTask = {
    id: `task-${Date.now()}`,
    nanoid: `nanoid-${Date.now()}`,
    prompt,
    negativePrompt,
    imageUrl:
      "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/dw_openpose_full.webp",
    thumbnailUrl:
      "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/dw_openpose_full.webp",
    status: "DONE",
    completedAt: new Date().toISOString(),
    model: {
      id: "model-1",
      name: "AnimeModel v1.0",
    },
    seed: Math.floor(Math.random() * 1000000),
    steps: 20,
    scale: 7.5,
    sampler: "DPM++ 2M Karras",
    sizeType: "512x768",
    rating: 0,
    isProtected: false,
  }

  return json({ newTask })
}

const ViewerTokenQuery = graphql(
  `query ViewerTokenQuery {
    viewer {
      id
      token
    }
  }`,
)

export const meta: MetaFunction = (props) => {
  const siteName = "Imagine - AI画像生成"
  const description =
    "シンプルで直感的なAI画像生成。プロンプトを入力するだけで美しい画像を生成できます。"

  return createMeta(
    { title: siteName, description: description },
    undefined,
    props.params.lang,
  )
}

/**
 * 画像生成（Imagine）- モバイル版
 */
export default function ImaginePage() {
  const { imageGenerationTasks: initialTasks, nextCursor } =
    useLoaderData<LoaderData>()
  const [tasks, setTasks] = useState<ImageGenerationTask[]>(initialTasks)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isTextView, setIsTextView] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetcher = useFetcher<LoaderData>()
  const submitFetcher = useFetcher()

  const { data: token } = useQuery(ViewerTokenQuery)
  const localStorageUserToken = getUserToken()
  const viewerUserToken = token?.viewer?.token
  const context = useImagineContext()

  useEffect(() => {
    if (localStorageUserToken !== null) {
      const decoded = jwtDecode(localStorageUserToken)
      if (decoded.exp && decoded.exp < Date.now() / 1000 && viewerUserToken) {
        context.changeCurrentUserToken(viewerUserToken)
        setUserToken(viewerUserToken)
      } else {
        context.changeCurrentUserToken(localStorageUserToken)
      }
    } else if (viewerUserToken) {
      context.changeCurrentUserToken(viewerUserToken)
      setUserToken(viewerUserToken)
    }
  }, [localStorageUserToken, viewerUserToken])

  useEffect(() => {
    context.resetImageInputSetting()
  }, [])

  // Handle infinite scroll
  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoading) return

    setIsLoading(true)
    fetcher.load(`?cursor=${nextCursor}&limit=20`)
  }, [nextCursor, isLoading, fetcher])

  // Add new tasks from infinite scroll
  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data &&
      typeof fetcher.data === "object" &&
      "imageGenerationTasks" in fetcher.data
    ) {
      const data = fetcher.data as LoaderData
      setTasks((prev) => [...prev, ...data.imageGenerationTasks])
      setIsLoading(false)
    }
  }, [fetcher.state, fetcher.data])

  // Add optimistic task from form submission
  useEffect(() => {
    if (
      submitFetcher.state === "idle" &&
      submitFetcher.data &&
      typeof submitFetcher.data === "object" &&
      "newTask" in submitFetcher.data
    ) {
      const data = submitFetcher.data as { newTask: ImageGenerationTask }
      if (data.newTask) {
        setTasks((prev) => [data.newTask, ...prev])
      }
    }
  }, [submitFetcher.state, submitFetcher.data])

  const handleReload = () => {
    setTasks(initialTasks)
    // Trigger reload logic here
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f8f8f8] dark:bg-[#121212]">
      <ImagineHeader
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        isTextView={isTextView}
        setIsTextView={setIsTextView}
        onReload={handleReload}
        isLoading={isLoading}
      />

      <ImagineHistoryList
        tasks={tasks}
        isTextView={isTextView}
        onLoadMore={loadMore}
        hasNext={!!nextCursor}
      />

      <ImagineFooterForm
        fetcher={submitFetcher}
        isSubmitting={submitFetcher.state === "submitting"}
      />
    </main>
  )
}
