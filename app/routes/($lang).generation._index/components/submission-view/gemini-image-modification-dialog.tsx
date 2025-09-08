import { useState } from "react"
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
const getOptimalImageSize = (imageUrl: string): Promise<string> => {
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
  console.info("[GeminiImageModification] Fallback fetch start", {
    imageUrl: props.imageUrl,
  })
  const response = await fetch(props.imageUrl, {
    // 認証付きの同一オリジン画像など、必要に応じてクッキー同送
    credentials: "include",
  })
  console.info("[GeminiImageModification] Fallback fetch response", {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`)
  }
  const blob = await response.blob()
  const mimeType = blob.type || "image/png"
  console.info("[GeminiImageModification] Blob info", { mimeType, size: blob.size })

  // FileReaderでBase64(Data URL)へ変換
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // "data:mime;base64,xxxxx" からカンマ以降を抽出
      const commaIndex = result.indexOf(",")
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
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
    const extensions = isRecord(item["extensions"]) ? item["extensions"] : undefined
    const code = extensions && safeString(extensions["code"]) ? (extensions["code"] as string) : undefined
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
  const name = isRecord(error) && typeof error["name"] === "string" ? (error["name"] as string) : undefined
  const message = isRecord(error) && typeof error["message"] === "string" ? (error["message"] as string) : undefined
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
    console.info("[GeminiImageModification] Submit start", {
      imageUrl: props.imageUrl,
      imageUrlOrigin,
      promptLength: prompt.length,
    })

    setIsCreatingTask(true)

    try {
      // 画像サイズを動的に決定
      const optimalSize = await getOptimalImageSize(props.imageUrl)
      console.info("[GeminiImageModification] Decided size", { optimalSize })

      // まずはimageUrlで作成を試行
      const variablesFirst = {
        input: {
          prompt: prompt,
          imageUrl: props.imageUrl,
          size: optimalSize,
        },
      }
      console.info("[GeminiImageModification] Attempt #1 (imageUrl)", {
        hasImageUrl: Boolean(props.imageUrl),
        size: optimalSize,
      })

      try {
        const result = await createAiTask({ variables: variablesFirst })
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
        console.warn("[GeminiImageModification] Attempt #1 failed", details)
      }

      // フォールバック: クライアントで画像をBase64化して送信
      try {
        const { base64, mimeType } = await fetchImageAsBase64({
          imageUrl: props.imageUrl,
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
            },
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
