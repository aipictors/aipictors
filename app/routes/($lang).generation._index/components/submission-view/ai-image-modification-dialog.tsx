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
 * 画像の縦横比とサイズに基づいて適切なImageSizeを決定する
 * SQUARE_512: 512x512 (小)
 * SQUARE_768: 768x768 (中)
 * SQUARE_1024: 1024x1024 (大)
 * LANDSCAPE: 1280x720 (横長)
 * PORTRAIT: 720x1280 (縦長)
 */
const getOptimalImageSize = (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const aspectRatio = img.width / img.height
      const width = img.width
      const height = img.height
      const maxSize = Math.max(width, height)

      // 正方形に近い場合（アスペクト比が0.9〜1.1の範囲）
      if (Math.abs(aspectRatio - 1) < 0.1) {
        if (maxSize <= 600) {
          resolve("SQUARE_512")
        } else if (maxSize <= 900) {
          resolve("SQUARE_768")
        } else {
          resolve("SQUARE_1024")
        }
      }
      // 横長の場合（アスペクト比が1.5以上）
      else if (aspectRatio >= 1.5) {
        resolve("LANDSCAPE")
      }
      // 縦長の場合（アスペクト比が0.67以下）
      else if (aspectRatio <= 0.67) {
        resolve("PORTRAIT")
      }
      // 中間的なアスペクト比の場合は正方形を選択
      else {
        if (maxSize <= 600) {
          resolve("SQUARE_512")
        } else if (maxSize <= 900) {
          resolve("SQUARE_768")
        } else {
          resolve("SQUARE_1024")
        }
      }
    }
    img.onerror = () => {
      // エラーの場合はデフォルトで中サイズ
      resolve("SQUARE_768")
    }
    img.src = imageUrl
  })
}

/**
 * AI画像修正ダイアログ
 */
export function AiImageModificationDialog(props: Props) {
  const [prompt, setPrompt] = useState("")
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const t = useTranslation()

  const [createAiTask] = useMutation<{
    createGeminiImageGenerationTask: AiTaskResult
  }>(createAiImageGenerationTaskMutation)

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

    setIsCreatingTask(true)

    try {
      // 画像サイズを動的に決定
      const optimalSize = await getOptimalImageSize(props.imageUrl)

      const result = await createAiTask({
        variables: {
          input: {
            prompt: prompt,
            imageUrl: props.imageUrl,
            size: optimalSize,
          },
        },
      })

      // 結果を親コンポーネントに通知
      if (props.onTaskCreated && result.data?.createGeminiImageGenerationTask) {
        props.onTaskCreated(result.data.createGeminiImageGenerationTask)
      }

      toast.success(
        t(
          "画像修正リクエストを送信しました",
          "Image modification request sent",
        ),
      )

      // プロンプトをクリアしてダイアログを確実に閉じる
      setPrompt("")
      setTimeout(() => {
        handleClose()
      }, 100)
    } catch {
      toast.error(
        t(
          "画像修正タスクの作成に失敗しました",
          "Failed to create image modification task",
        ),
      )
      // エラー時もダイアログを閉じる
      setTimeout(() => {
        handleClose()
      }, 100)
    } finally {
      setIsCreatingTask(false)
    }
  }

  const handleClose = () => {
    setPrompt("")
    setIsCreatingTask(false)
    props.onClose()
  }

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("AI画像修正(Nano Banana)", "AI Image Modification")}
          </DialogTitle>
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
              onClick={handleClose}
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

const createAiImageGenerationTaskMutation = graphql(
  `mutation CreateGeminiImageGenerationTask($input: CreateGeminiImageGenerationTaskInput!) {
    createGeminiImageGenerationTask(input: $input) {
      id
      nanoid
      status
    }
  }`,
)
