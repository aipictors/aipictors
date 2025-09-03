import { useState, useEffect, useRef } from "react"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Sparkles, Loader2Icon, Settings } from "lucide-react"
import { cn } from "~/lib/utils"
import { useTranslation } from "~/hooks/use-translation"
import { toast } from "sonner"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { sha256 } from "~/utils/sha256"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  canUseAiGeneration,
  consumeAiGenerationUsage,
} from "../utils/ai-generation-usage"
import { ContentTypeSelector } from "./content-type-selector"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"

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

type Props = {
  title: string
  caption?: string
  onTitleChange: (value: string) => void
  onCaptionChange: (value: string) => void
  // AI自動生成ボタン関連のprops
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
  isGenerating?: boolean
  onGenerateStart?: () => void
}

/**
 * タイトル（必須）・キャプション統合入力コンポーネント
 */
export function PostFormItemTitleCaption(props: Props) {
  const t = useTranslation()
  const [localTitle, setLocalTitle] = useState(props.title || "")
  const [localCaption, setLocalCaption] = useState(props.caption || "")
  const [isLocalGenerating, setIsLocalGenerating] = useState(false)
  const [contentType, setContentType] = useState<
    "STORY" | "CHARACTER" | "STANDARD"
  >("STORY")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const [generateContent] = useMutation(GenerateImageContentMutation)

  const titleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const captionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isTitleFilled = localTitle.trim() !== ""
  const isCaptionFilled = localCaption.trim() !== ""

  /**
   * JPEGに変換する関数
   */
  const convertToJpeg = async (base64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
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

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setLocalTitle(value)

    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
    }

    titleTimeoutRef.current = setTimeout(() => {
      props.onTitleChange(value)
    }, 300)
  }

  const handleCaptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = event.target.value
    setLocalCaption(value)

    if (captionTimeoutRef.current) {
      clearTimeout(captionTimeoutRef.current)
    }

    captionTimeoutRef.current = setTimeout(() => {
      props.onCaptionChange(value)
    }, 300)
  }

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

    setIsLocalGenerating(true)
    if (props.onGenerateStart) {
      props.onGenerateStart()
    }

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
            tagsOnly: false,
            contentType,
          },
        },
      })

      const data = result.data?.generateImageContent
      if (data) {
        props.onContentGenerated(data)
        toast(
          t("コンテンツを自動生成しました", "Content generated successfully"),
        )
      } else {
        throw new Error("No data returned from generation")
      }
    } catch (error) {
      console.error("Failed to generate content:", error)
      toast(t("自動生成に失敗しました", "Failed to generate content"))
    } finally {
      setIsLocalGenerating(false)
    }
  }

  // propsが更新されたらlocalValueも更新する
  useEffect(() => {
    setLocalTitle(props.title || "")
  }, [props.title])

  useEffect(() => {
    setLocalCaption(props.caption || "")
  }, [props.caption])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
      if (captionTimeoutRef.current) {
        clearTimeout(captionTimeoutRef.current)
      }
    }
  }, [])

  const isGenerating = isLocalGenerating || props.isGenerating

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {/* セクションタイトルと自動生成ボタン */}
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm">
            {t("タイトル（必須）・キャプション", "Title (Required) & Caption")}
          </p>
          <div className="items-center gap-2 md:flex">
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>{t("設定", "Settings")}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="absolute z-10 mt-2 rounded-lg border bg-card p-4 shadow-lg">
                <ContentTypeSelector
                  value={contentType}
                  onChange={setContentType}
                />
              </CollapsibleContent>
            </Collapsible>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !props.imageBase64}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>
                {isGenerating
                  ? t("生成中...", "Generating...")
                  : t("自動生成（タグ含む）", "Auto Generate")}
              </span>
            </Button>
          </div>
        </div>

        {/* タイトル入力欄 */}
        <div className="space-y-2">
          <label
            htmlFor="title-input"
            className="font-medium text-muted-foreground text-sm"
          >
            {t("タイトル", "Title")}
          </label>
          {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
          <Input
            id="title-input"
            onChange={handleTitleChange}
            value={localTitle}
            minLength={1}
            maxLength={120}
            required
            type="text"
            name="title"
            placeholder={t("タイトルを入力してください", "Enter title")}
            className={cn("w-full", {
              "border-green-500": isTitleFilled,
              "border-gray-300": !isTitleFilled,
            })}
          />
        </div>

        {/* キャプション入力欄 */}
        <div className="space-y-2">
          <label
            htmlFor="caption-input"
            className="font-medium text-muted-foreground text-sm"
          >
            {t("キャプション（任意）", "Caption (Optional)")}
          </label>
          {/** biome-ignore lint/nursery/useUniqueElementIds: <explanation> */}
          <AutoResizeTextarea
            id="caption-input"
            onChange={handleCaptionChange}
            value={localCaption}
            maxLength={3000}
            placeholder={t("キャプションを入力してください", "Enter caption")}
            className={cn("w-full", {
              "border-green-500": isCaptionFilled,
              "border-gray-300": !isCaptionFilled,
            })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
