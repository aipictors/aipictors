import { useMemo, useCallback } from "react"
import { type Tag, TagInput } from "~/components/tag/tag-input"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  tags: Tag[]
  whiteListTags: Tag[]
  recommendedTags: Tag[]
  recentlyUsedTags: Tag[]
  onAddTag(tag: Tag): void
  onRemoveTag(tag: Tag): void
}

/**
 * タグ入力
 */
export function PostFormItemTags(props: Props) {
  const t = useTranslation()
  const whiteListTags = props.whiteListTags

  const getRandomId = useCallback(() => {
    return Math.floor(Math.random() * 10000)
  }, [])

  const formattedTags = useMemo(
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

  const displayTags =
    props.recentlyUsedTags.length > 0
      ? props.recentlyUsedTags
      : props.recommendedTags

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {t(
            `タグ (${props.tags.length}/10)`,
            `Tags (${props.tags.length}/10)`,
          )}
        </p>
        <TagInput
          placeholder={t("タグを追加してください", "Add tags")}
          tags={props.tags}
          maxTags={10}
          maxLength={160}
          className="sm:min-w-[450px]"
          onTagAdd={handleTagAdd}
          onTagRemove={handleTagRemove}
          setTags={() => {}}
          autocompleteOptions={formattedWhiteListTags}
          enableAutocomplete={true}
          placeholderWhenFull={t("タグは10個までです", "Up to 10 tags allowed")}
        />
        <div className="space-y-2 pt-2">
          <p className="text-sm">
            {t(
              "プロンプト付きの画像を読み込むとおすすめタグが更新されます(Dall-Eなどは非対応)",
              "Recommended tags will be updated when an image with a prompt is loaded (not supported by Dall-E)",
            )}
          </p>
          {displayTags.length !== 0 && (
            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag) => (
                <Button
                  key={tag.id}
                  size={"sm"}
                  variant={"secondary"}
                  onClick={() => {
                    if (props.tags.length >= 10) {
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}
