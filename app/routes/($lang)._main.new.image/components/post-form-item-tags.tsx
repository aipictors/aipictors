import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Hash, Loader2Icon, Settings } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { type Tag, TagInput } from "~/components/tag/tag-input"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import { useTranslation } from "~/hooks/use-translation"
import { MAX_POST_TAGS } from "~/routes/($lang)._main.new.image/utils/post-form-generated-content"
import { getAiAnalysisImageUrl } from "~/utils/to-ai-analysis-image"
import { uploadPublicImage } from "~/utils/upload-public-image"
import {
  canUseAiGeneration,
  consumeAiGenerationUsage,
} from "../utils/ai-generation-usage"
import { splitPostFormTagSuggestions } from "../utils/post-form-tag-suggestions"
import { ContentTypeSelector } from "./content-type-selector"

type Props = {
  /** タグ入力欄に初めて触れたときに候補を読み込む */
  onTagInputFocus?: () => void
  tags: Tag[]
  whiteListTags: Tag[]
  recommendedTags: Tag[]
  recentlyUsedTags: Tag[]
  onAddTag(tag: Tag): void
  onRemoveTag(tag: Tag): void
  // タグ自動生成関連のprops
  imageBase64?: string | null
  token?: string | undefined | null
  onTagsGenerated?: (data: {
    title?: string
    description?: string
    tags?: string[]
    titleEn?: string
    descriptionEn?: string
    tagsEn?: string[]
  }) => void
}

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
 * タグ入力
 */
export function PostFormItemTags(props: Props) {
  const t = useTranslation()
  const whiteListTags = props.whiteListTags
  const [isGenerating, setIsGenerating] = useState(false)
  const [contentType, setContentType] = useState<
    "STORY" | "CHARACTER" | "STANDARD"
  >("STORY")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  // GraphQL mutation
  const [generateContent] = useMutation(GenerateImageContentMutation)

  /**
   * 画像URLを取得（縮小 JPEG にしてアップロード。同じ画像はタイトル生成と共通で 1 回だけ）
   */
  const getImageUrl = (base64: string): Promise<string> =>
    getAiAnalysisImageUrl(base64, (jpegDataUrl) =>
      uploadPublicImage(jpegDataUrl, props.token),
    )

  const getRandomId = useCallback(() => {
    return Math.floor(Math.random() * 10000)
  }, [])

  const _formattedTags = useMemo(
    () =>
      props.tags.map((tag) => ({
        id: tag.id,
        text: tag.text,
        label: tag.text,
        value: tag.text,
      })),
    [props.tags],
  )

  const formattedWhiteListTags = useMemo(
    () =>
      whiteListTags.map((tag) => ({
        id: tag.id,
        text: tag.text,
        label: tag.text,
        value: tag.text,
      })),
    [whiteListTags],
  )

  const handleTagAdd = useCallback(
    (tag: string) => {
      props.onAddTag({ id: getRandomId().toString(), text: tag })
    },
    [getRandomId, props.onAddTag],
  )

  const handleTagRemove = useCallback(
    (tag: string) => {
      props.onRemoveTag({
        id: props.tags.find((t) => t.text === tag)?.id ?? "",
        text: tag,
      })
    },
    [props.tags, props.onRemoveTag],
  )

  const suggestions = splitPostFormTagSuggestions({
    tags: props.tags,
    recentlyUsedTags: props.recentlyUsedTags,
    recommendedTags: props.recommendedTags,
  })

  const renderSuggestedTags = (tags: Tag[]) => (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Button
          key={tag.id}
          size={"sm"}
          variant={"secondary"}
          onClick={() => {
            if (props.tags.length >= MAX_POST_TAGS) {
              return
            }
            props.onAddTag({
              id: tag.id,
              text: tag.text,
            })
          }}
        >
          {tag.text}
        </Button>
      ))}
    </div>
  )

  const handleTagGenerate = async () => {
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

    setIsGenerating(true)

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

      // 実際のGraphQL mutationを実行（タグのみ生成）
      const result = await generateContent({
        variables: {
          input: {
            imageUrl,
            tagsOnly: true,
            contentType,
          },
        },
      })

      const data = result.data?.generateImageContent
      if (data && props.onTagsGenerated) {
        props.onTagsGenerated(data)
        toast(t("タグを自動生成しました", "Tags generated successfully"))
      } else {
        throw new Error("No data returned from generation")
      }
    } catch (error) {
      console.error("Failed to generate tags:", error)
      toast(t("タグの自動生成に失敗しました", "Failed to generate tags"))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        {/* ヘッダー部分：タグタイトルとタグ自動生成ボタン */}
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-sm">
            {t(
              `タグ (${props.tags.length}/${MAX_POST_TAGS})`,
              `Tags (${props.tags.length}/${MAX_POST_TAGS})`,
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
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
              onClick={handleTagGenerate}
              disabled={isGenerating || !props.imageBase64}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <Hash className="h-4 w-4" />
              )}
              <span>
                {isGenerating
                  ? t("生成中...", "Generating...")
                  : t("タグ自動生成", "Auto Generate Tags")}
              </span>
            </Button>
          </div>
        </div>
        <TagInput
          placeholder={t("タグを追加してください", "Add tags")}
          tags={props.tags}
          maxTags={MAX_POST_TAGS}
          maxLength={160}
          onFocus={props.onTagInputFocus}
          onTagAdd={handleTagAdd}
          onTagRemove={handleTagRemove}
          setTags={() => {}}
          autocompleteOptions={formattedWhiteListTags}
          enableAutocomplete={true}
          placeholderWhenFull={t(
            `タグは${MAX_POST_TAGS}個までです`,
            `Up to ${MAX_POST_TAGS} tags allowed`,
          )}
        />
        {suggestions.recentlyUsedTags.length !== 0 && (
          <div className="space-y-2 pt-2">
            <p className="font-bold text-muted-foreground text-xs">
              {t("最近使ったタグ", "Recently used tags")}
            </p>
            {renderSuggestedTags(suggestions.recentlyUsedTags)}
          </div>
        )}
        <div className="space-y-2 pt-2">
          <p className="font-bold text-muted-foreground text-xs">
            {t("おすすめタグ", "Recommended tags")}
          </p>
          <p className="text-muted-foreground text-xs">
            {t(
              "プロンプト付きの画像を読み込むとおすすめタグが更新されます(Dall-Eなどは非対応)",
              "Recommended tags will be updated when an image with a prompt is loaded (not supported by Dall-E)",
            )}
          </p>
          {suggestions.recommendedTags.length !== 0 &&
            renderSuggestedTags(suggestions.recommendedTags)}
        </div>
      </CardContent>
    </Card>
  )
}
