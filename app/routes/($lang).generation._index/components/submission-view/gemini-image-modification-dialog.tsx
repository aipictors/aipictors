import { useState, useEffect, useRef } from "react"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { Loader2Icon } from "lucide-react"
import {
  logInfo,
  logWarn,
  logError,
} from "~/routes/($lang).generation._index/utils/client-diagnostics-logger"
import type { GeminiImageSize } from "~/types/gemini-image-generation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { useIpAddress } from "~/hooks/use-ip-address"

type AiTaskResult = {
  id: string
  nanoid: string
  status: string
}

type Props = {
  isOpen: boolean
  onClose(): void
  taskId: string
  token: string
  imageUrl: string
  userNanoid: string | null
  originalPrompt?: string
  onTaskCreated?: (result: AiTaskResult) => void
}

/**
 * 画像の縦横比に基づいて適切なImageSizeを決定する
 */
const getOptimalImageSize = (imageUrl: string): Promise<GeminiImageSize> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const aspectRatio = img.width / img.height

      if (Math.abs(aspectRatio - 1) < 0.1) {
        // 正方形に近い場合
        resolve("SQUARE_1024")
      } else if (aspectRatio > 1.3) {
        // 横長の場合
        resolve("LANDSCAPE")
      } else if (aspectRatio < 0.8) {
        // 縦長の場合
        resolve("PORTRAIT")
      } else {
        // その他の場合はデフォルトで正方形
        resolve("SQUARE_1024")
      }
    }
    img.onerror = () => {
      // エラーの場合はデフォルト
      resolve("SQUARE_1024")
    }
    img.src = imageUrl
  })
}

/**
 * 外部URLをクライアント側で取得し、Base64とMIMEタイプに変換する
 * - サーバーが外部画像URLへアクセスできないユーザー環境向けのフォールバック
 */
const fetchImageAsBase64 = async (props: { imageUrl: string }) => {
  logInfo({
    source: "GeminiImageModification",
    message: "Fallback fetch start",
    details: { imageUrl: props.imageUrl },
  })
  console.info("[GeminiImageModification] Fallback fetch start", {
    imageUrl: props.imageUrl,
  })

  // 1回目: 資格情報なしでフェッチ（CORS要件を緩和）
  let response: Response | null = null
  try {
    response = await fetch(props.imageUrl, { credentials: "omit" })
    logInfo({
      source: "GeminiImageModification",
      message: "Fallback fetch #1 (omit) response",
      details: {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      },
    })
    console.info(
      "[GeminiImageModification] Fallback fetch #1 (omit) response",
      {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      },
    )
  } catch (e) {
    logWarn({
      source: "GeminiImageModification",
      message: "Fallback fetch #1 (omit) threw",
      details: e,
    })
    console.warn("[GeminiImageModification] Fallback fetch #1 (omit) threw", e)
  }

  // 2回目: 同一オリジンや認証が必要な場合を考慮してクッキー同送
  if (!response || !response.ok) {
    try {
      const res2 = await fetch(props.imageUrl, { credentials: "include" })
      logInfo({
        source: "GeminiImageModification",
        message: "Fallback fetch #2 (include) response",
        details: {
          ok: res2.ok,
          status: res2.status,
          statusText: res2.statusText,
        },
      })
      console.info(
        "[GeminiImageModification] Fallback fetch #2 (include) response",
        { ok: res2.ok, status: res2.status, statusText: res2.statusText },
      )
      response = res2
    } catch (e) {
      logWarn({
        source: "GeminiImageModification",
        message: "Fallback fetch #2 (include) threw",
        details: e,
      })
      console.warn(
        "[GeminiImageModification] Fallback fetch #2 (include) threw",
        e,
      )
    }
  }

  if (!response || !response.ok) {
    const status = response
      ? `${response.status} ${response.statusText}`
      : "no-response"
    logError({
      source: "GeminiImageModification",
      message: "Failed to fetch image",
      details: { status },
    })
    throw new Error(`Failed to fetch image (${status})`)
  }

  const blob = await response.blob()
  const mimeType = blob.type || "image/png"
  logInfo({
    source: "GeminiImageModification",
    message: "Blob info",
    details: { mimeType, size: blob.size },
  })
  console.info("[GeminiImageModification] Blob info", {
    mimeType,
    size: blob.size,
  })

  // FileReaderでBase64(Data URL)へ変換
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== "string") {
        logError({
          source: "GeminiImageModification",
          message: "Unexpected FileReader result",
        })
        reject(new Error("Unexpected FileReader result"))
        return
      }
      // "data:mime;base64,xxxxx" からカンマ以降を抽出
      const commaIndex = result.indexOf(",")
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result)
    }
    reader.onerror = () => {
      logError({
        source: "GeminiImageModification",
        message: "FileReader error",
        details: reader.error ?? undefined,
      })
      reject(reader.error ?? new Error("FileReader error"))
    }
    reader.readAsDataURL(blob)
  })
  logInfo({
    source: "GeminiImageModification",
    message: "Base64 ready",
    details: { length: base64.length },
  })
  console.info("[GeminiImageModification] Base64 ready", {
    length: base64.length,
  })

  return { base64, mimeType }
}

// ------------- コンソールログ用ユーティリティ -------------
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const safeString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value
  return undefined
}

const extractGraphQLErrors = (
  error: unknown,
): Array<{ message?: string; code?: string }> | undefined => {
  if (!isRecord(error)) return undefined
  const gql = error["graphQLErrors"]
  if (!Array.isArray(gql)) return undefined
  const list: Array<{ message?: string; code?: string }> = []
  for (const item of gql) {
    if (!isRecord(item)) continue
    const message = safeString(item["message"]) ?? undefined
    const extensions = isRecord(item["extensions"])
      ? item["extensions"]
      : undefined
    const code =
      extensions && safeString(extensions["code"])
        ? (extensions["code"] as string)
        : undefined
    list.push({ message, code })
  }
  return list.length > 0 ? list : undefined
}

const extractNetworkErrorMessage = (error: unknown): string | undefined => {
  if (!isRecord(error)) return undefined
  const net = error["networkError"]
  if (!isRecord(net)) return undefined
  const msg = net["message"]
  return typeof msg === "string" ? msg : undefined
}

const summarizeError = (error: unknown) => {
  const gql = extractGraphQLErrors(error)
  const net = extractNetworkErrorMessage(error)
  const name =
    isRecord(error) && typeof error["name"] === "string"
      ? (error["name"] as string)
      : undefined
  const message =
    isRecord(error) && typeof error["message"] === "string"
      ? (error["message"] as string)
      : undefined
  return { name, message, graphQLErrors: gql, networkErrorMessage: net }
}

// ------------- ここまでユーティリティ -------------

/**
 * AI画像修正ダイアログ
 */
export function GeminiImageModificationDialog(props: Props) {
  const [prompt, setPrompt] = useState("")
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const t = useTranslation()

  // IPアドレス取得（バックエンド側でスキーマ更新後に有効化）
  const { ipInfo } = useIpAddress()

  // ------- モバイル判定とキーボード回避 -------
  const [isMobile, setIsMobile] = useState(false)
  const [bottomInset, setBottomInset] = useState(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    // クライアントでのみ実行
    const mq =
      typeof window !== "undefined"
        ? window.matchMedia("(max-width: 767px)")
        : null
    const update = () => setIsMobile(Boolean(mq?.matches))
    update()
    mq?.addEventListener("change", update)
    return () => mq?.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!isMobile || !props.isOpen) return
    const vv: VisualViewport | undefined =
      typeof window !== "undefined"
        ? (window.visualViewport ?? undefined)
        : undefined
    if (!vv) return

    const onResize = () => {
      try {
        // キーボード表示時に下部が隠れる分の高さを推定
        const keyboardHeight = Math.max(
          0,
          window.innerHeight - (vv.height + vv.offsetTop),
        )
        setBottomInset(Math.ceil(keyboardHeight))
      } catch {
        // ignore
      }
    }
    onResize()
    vv.addEventListener("resize", onResize)
    vv.addEventListener("scroll", onResize)
    return () => {
      vv.removeEventListener("resize", onResize)
      vv.removeEventListener("scroll", onResize)
    }
  }, [isMobile, props.isOpen])

  const handleTextareaFocus = () => {
    // テキストエリアを見える位置にスクロール
    textareaRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
  }

  const [createAiTask] = useMutation<{
    createGeminiImageGenerationTask: AiTaskResult
  }>(createGeminiImageGenerationTaskMutation)

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error(
        t(
          "修正内容を入力してください",
          "Please enter modification instructions",
        ),
      )
      return
    }

    // 送信開始ログ
    let imageUrlOrigin: string | undefined
    try {
      imageUrlOrigin = new URL(props.imageUrl).origin
    } catch {
      imageUrlOrigin = undefined
    }
    logInfo({
      source: "GeminiImageModification",
      message: "Submit start",
      details: {
        imageUrl: props.imageUrl,
        imageUrlOrigin,
        promptLength: prompt.length,
      },
    })
    console.info("[GeminiImageModification] Submit start", {
      imageUrl: props.imageUrl,
      imageUrlOrigin,
      promptLength: prompt.length,
    })

    setIsCreatingTask(true)

    try {
      // 画像サイズを動的に決定
      const optimalSize: GeminiImageSize = await getOptimalImageSize(
        props.imageUrl,
      )
      logInfo({
        source: "GeminiImageModification",
        message: "Decided size",
        details: { optimalSize },
      })
      console.info("[GeminiImageModification] Decided size", { optimalSize })

      // まずはimageUrlで作成を試行
      const variablesFirst = {
        input: {
          prompt: prompt,
          imageUrl: props.imageUrl,
          size: optimalSize,
          ipaddress: ipInfo?.ip || null,
        },
      }
      logInfo({
        source: "GeminiImageModification",
        message: "Attempt #1 (imageUrl)",
        details: { hasImageUrl: Boolean(props.imageUrl), size: optimalSize },
      })
      console.info("[GeminiImageModification] Attempt #1 (imageUrl)", {
        hasImageUrl: Boolean(props.imageUrl),
        size: optimalSize,
      })

      try {
        const result = await createAiTask({ variables: variablesFirst })
        logInfo({
          source: "GeminiImageModification",
          message: "Attempt #1 success",
          details: {
            id: result.data?.createGeminiImageGenerationTask?.id,
            status: result.data?.createGeminiImageGenerationTask?.status,
            nanoid: result.data?.createGeminiImageGenerationTask?.nanoid,
          },
        })
        console.info("[GeminiImageModification] Attempt #1 success", {
          id: result.data?.createGeminiImageGenerationTask?.id,
          status: result.data?.createGeminiImageGenerationTask?.status,
          nanoid: result.data?.createGeminiImageGenerationTask?.nanoid,
        })

        // 結果を親コンポーネントに通知
        if (
          props.onTaskCreated &&
          result.data?.createGeminiImageGenerationTask
        ) {
          props.onTaskCreated(result.data.createGeminiImageGenerationTask)
        }

        toast.success(
          t(
            "画像修正リクエストを送信しました",
            "Image modification request sent",
          ),
        )
        props.onClose()
        return
      } catch (error) {
        const details = summarizeError(error)
        logWarn({
          source: "GeminiImageModification",
          message: "Attempt #1 failed",
          details,
        })
        console.warn("[GeminiImageModification] Attempt #1 failed", details)
      }

      // フォールバック: クライアントで画像をBase64化して送信
      try {
        const { base64, mimeType } = await fetchImageAsBase64({
          imageUrl: props.imageUrl,
        })
        logInfo({
          source: "GeminiImageModification",
          message: "Attempt #2 (base64)",
          details: { mimeType, base64Length: base64.length, size: optimalSize },
        })
        console.info("[GeminiImageModification] Attempt #2 (base64)", {
          mimeType,
          base64Length: base64.length,
          size: optimalSize,
        })

        const result = await createAiTask({
          variables: {
            input: {
              prompt: prompt,
              imageBase64: base64,
              mimeType: mimeType,
              size: optimalSize,
              ipaddress: ipInfo?.ip || null,
            },
          },
        })
        logInfo({
          source: "GeminiImageModification",
          message: "Attempt #2 success",
          details: {
            id: result.data?.createGeminiImageGenerationTask?.id,
            status: result.data?.createGeminiImageGenerationTask?.status,
            nanoid: result.data?.createGeminiImageGenerationTask?.nanoid,
          },
        })
        console.info("[GeminiImageModification] Attempt #2 success", {
          id: result.data?.createGeminiImageGenerationTask?.id,
          status: result.data?.createGeminiImageGenerationTask?.status,
          nanoid: result.data?.createGeminiImageGenerationTask?.nanoid,
        })

        if (
          props.onTaskCreated &&
          result.data?.createGeminiImageGenerationTask
        ) {
          props.onTaskCreated(result.data.createGeminiImageGenerationTask)
        }

        toast.success(
          t(
            "画像修正リクエストを送信しました",
            "Image modification request sent",
          ),
        )
        props.onClose()
      } catch (error) {
        const details = summarizeError(error)
        logError({
          source: "GeminiImageModification",
          message: "Attempt #2 failed",
          details,
        })
        console.error("[GeminiImageModification] Attempt #2 failed", details)

        const code = details.graphQLErrors?.[0]?.code
        const message =
          details.graphQLErrors?.[0]?.message || details.networkErrorMessage

        const friendly =
          code === "UNAUTHENTICATED"
            ? t("ログインが必要です", "Login required")
            : code === "FORBIDDEN"
              ? t("権限がありません", "Forbidden")
              : code === "INSUFFICIENT_CREDITS"
                ? t(
                    "残り枚数が不足しています",
                    "Insufficient credits remaining",
                  )
                : code === "BAD_USER_INPUT"
                  ? t("入力内容をご確認ください", "Bad user input")
                  : undefined

        toast.error(
          friendly ??
            t(
              "画像修正タスクの作成に失敗しました",
              "Failed to create image modification task",
            ) + (message ? `: ${message}` : ""),
        )
      }
    } finally {
      setIsCreatingTask(false)
    }
  }

  // ------- モバイルでは下部シート、デスクトップは従来のダイアログ -------
  if (isMobile) {
    return (
      <Sheet
        open={props.isOpen}
        onOpenChange={(open) => !open && props.onClose()}
      >
        <SheetContent
          side="bottom"
          className="h-[100svh] max-h-[100svh] w-full p-0"
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b p-4">
              <SheetTitle>
                {t("AI画像修正", "AI Image Modification")}
              </SheetTitle>
            </SheetHeader>
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4"
              style={{
                paddingBottom: bottomInset ? bottomInset + 24 : undefined,
              }}
            >
              {/* 元画像プレビュー */}
              <div className="mb-4 flex justify-center">
                <img
                  src={props.imageUrl}
                  alt="Generated content"
                  className="max-h-64 max-w-full rounded-lg border"
                />
              </div>

              {/* 修正指示入力 */}
              <div className="space-y-2">
                <Label htmlFor="modification-prompt">
                  {t("修正内容", "Modification Instructions")}
                </Label>
                {/* biome-ignore lint/nursery/useUniqueElementIds: false positive */}
                <Textarea
                  id="modification-prompt"
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={handleTextareaFocus}
                  placeholder={t(
                    "どのように画像を修正(5枚消費)したいかを詳しく説明してください...",
                    "Please describe in detail how you want to modify the image...",
                  )}
                  className="min-h-32 scroll-mb-24"
                  maxLength={2000}
                />
                <div className="text-right text-muted-foreground text-sm">
                  {prompt.length} / 2000
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t p-4">
              <Button
                variant="outline"
                onClick={props.onClose}
                disabled={isCreatingTask}
              >
                {t("キャンセル", "Cancel")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreatingTask || !prompt.trim()}
              >
                {isCreatingTask && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isCreatingTask
                  ? t("修正中...", "Modifying...")
                  : t("画像を修正(5枚消費)", "Modify Image")}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={(open) => !open && props.onClose()}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("AI画像修正", "AI Image Modification")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 元画像プレビュー */}
          <div className="flex justify-center">
            <img
              src={props.imageUrl}
              alt="Generated content"
              className="max-h-64 max-w-full rounded-lg border"
            />
          </div>

          {/* 修正指示入力 */}
          <div className="space-y-2">
            <Label htmlFor="modification-prompt">
              {t("修正内容", "Modification Instructions")}
            </Label>
            {/* biome-ignore lint/nursery/useUniqueElementIds: false positive */}
            <Textarea
              id="modification-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t(
                "どのように画像を修正(5枚消費)したいかを詳しく説明してください...",
                "Please describe in detail how you want to modify the image...",
              )}
              className="min-h-32"
              maxLength={2000}
            />
            <div className="text-right text-muted-foreground text-sm">
              {prompt.length} / 2000
            </div>
          </div>

          {/* 操作ボタン */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={props.onClose}
              disabled={isCreatingTask}
            >
              {t("キャンセル", "Cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreatingTask || !prompt.trim()}
            >
              {isCreatingTask && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isCreatingTask
                ? t("修正中...", "Modifying...")
                : t("画像を修正(5枚消費)", "Modify Image")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const createGeminiImageGenerationTaskMutation = graphql(
  `mutation CreateGeminiImageGenerationTask($input: CreateGeminiImageGenerationTaskInput!) {
    createGeminiImageGenerationTask(input: $input) {
      id
      nanoid
      status
    }
  }`,
)
