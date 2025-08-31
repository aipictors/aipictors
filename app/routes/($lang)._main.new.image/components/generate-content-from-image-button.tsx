import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Loader2Icon, Sparkles, Hash } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { sha256 } from "~/utils/sha256"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  canUseAiGeneration,
  consumeAiGenerationUsage,
} from "../utils/ai-generation-usage"

type Props = {
  imageBase64: string | null
  token: string | undefined | null
  onContentGenerated: (data: {
    title?: string
    description?: string
    tags?: string[]
    titleEn?: string
    descriptionEn?: string
    tagsEn?: string[]
  }) => void
  tagsOnly?: boolean
}

// 画像URLのキャッシュ（メモリ内）
const imageUrlCache = new Map<string, string>()

// GraphQL mutation - バックエンドのスキーマ定義後に修正予定
const GenerateImageContentMutation = graphql(
  `mutation GenerateImageContent($input: GenerateImageContentInput!) {
    generateImageContent(input: $input) {
      title
      description
      tags
      titleEn
      descriptionEn
      tagsEn
    }
  }`,
) as unknown as ReturnType<typeof graphql>

/**
 * 画像から自動でタイトル、説明文、タグを生成するボタン
 */
export function GenerateContentFromImageButton(props: Props) {
  const t = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  // GraphQL mutation
  const [generateContent] = useMutation(GenerateImageContentMutation)

  /**
   * Base64画像をJPEGに変換する
   */
  const convertToJpeg = (base64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas context not available"))
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // JPEGとして出力（圧縮率0.8）
        const jpegBase64 = canvas.toDataURL("image/jpeg", 0.8)
        resolve(jpegBase64)
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = base64
    })
  }

  /**
   * 画像のアップロードとキャッシュ管理
   */
  const getImageUrl = async (imageBase64: string): Promise<string> => {
    try {
      // JPEGに変換
      const jpegBase64 = await convertToJpeg(imageBase64)

      // ハッシュを計算
      const hash = await sha256(jpegBase64)

      // キャッシュから取得を試行
      if (imageUrlCache.has(hash)) {
        const cachedUrl = imageUrlCache.get(hash)
        if (cachedUrl) {
          console.log("Using cached image URL:", cachedUrl)
          return cachedUrl
        }
      }

      // 新しい画像をアップロード
      console.log("Uploading new image...")
      const imageUrl = await uploadPublicImage(jpegBase64, props.token)
      if (!imageUrl) {
        throw new Error("Failed to upload image")
      }

      // キャッシュに保存
      imageUrlCache.set(hash, imageUrl)
      return imageUrl
    } catch (error) {
      console.error("Failed to upload image:", error)
      throw error
    }
  }

  /**
   * コンテンツ生成を実行
   */
  const handleGenerate = async () => {
    if (!props.imageBase64) {
      toast(t("画像を選択してください", "Please select an image"))
      return
    }

    if (!props.token) {
      toast(t("ログインが必要です", "Login required"))
      return
    }

    // 利用制限チェック
    if (!canUseAiGeneration()) {
      toast(
        t(
          "1日の利用回数上限（50回）に達しました。明日以降にお試しください。",
          "Daily usage limit (50 times) reached. Please try again tomorrow.",
        ),
      )
      return
    }

    setIsLoading(true)

    try {
      // 利用回数を消費
      if (!consumeAiGenerationUsage()) {
        toast(
          t(
            "1日の利用回数上限（50回）に達しました。明日以降にお試しください。",
            "Daily usage limit (50 times) reached. Please try again tomorrow.",
          ),
        )
        return
      }

      // 画像をアップロード（キャッシュ機能付き）
      const imageUrl = await getImageUrl(props.imageBase64)

      // 実際のGraphQL mutationを実行
      const result = await generateContent({
        variables: {
          input: {
            imageUrl,
            tagsOnly: props.tagsOnly || false,
          },
        },
      })

      // データの型を安全に処理
      const data = result.data?.generateImageContent as
        | {
            title?: string | null
            description?: string | null
            tags?: string[] | null
            titleEn?: string | null
            descriptionEn?: string | null
            tagsEn?: string[] | null
          }
        | undefined

      if (!data) {
        throw new Error("No data returned from AI generation")
      }

      props.onContentGenerated({
        title: data.title || undefined,
        description: data.description || undefined,
        tags: data.tags || undefined,
        titleEn: data.titleEn || undefined,
        descriptionEn: data.descriptionEn || undefined,
        tagsEn: data.tagsEn || undefined,
      })

      const successMessage = props.tagsOnly
        ? t("タグを自動生成しました", "Tags generated automatically")
        : t(
            "タイトル、説明文、タグを自動生成しました",
            "Title, description, and tags generated automatically",
          )

      toast(successMessage)
    } catch (error) {
      console.error("Failed to generate content:", error)
      toast(t("自動生成に失敗しました", "Failed to generate content"))
    } finally {
      setIsLoading(false)
    }
  }

  if (!props.imageBase64) {
    return null
  }

  const isUsageLimitReached = !canUseAiGeneration()

  return (
    <Button
      onClick={handleGenerate}
      disabled={isLoading || isUsageLimitReached}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      title={
        isUsageLimitReached
          ? t("1日の利用回数上限に達しました", "Daily usage limit reached")
          : undefined
      }
    >
      {isLoading ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : props.tagsOnly ? (
        <Hash className="h-4 w-4" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      <span>
        {isLoading
          ? t("生成中...", "Generating...")
          : isUsageLimitReached
            ? t("利用上限", "Limit Reached")
            : props.tagsOnly
              ? t("タグのみ生成", "Generate Tags Only")
              : t("AI自動生成", "AI Generate")}
      </span>
    </Button>
  )
}
