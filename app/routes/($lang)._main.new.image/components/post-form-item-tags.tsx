import { useMemo, useCallback } from "react"
import { type Tag, TagInput } from "~/components/tag/tag-input"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  tags: Tag[]
  whiteListTags: Tag[]
  recommendedTags: Tag[]
  onAddTag(tag: Tag): void
  onRemoveTag(tag: Tag): void
}

/**
 * タグ入力
 */
export const PostFormItemTags = (props: Props) => {
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

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{`タグ (${props.tags.length}/10)`}</p>
        <TagInput
          placeholder="タグを追加してください"
          tags={props.tags}
          maxTags={10}
          maxLength={160}
          className="sm:min-w-[450px]"
          onTagAdd={handleTagAdd}
          onTagRemove={handleTagRemove}
          setTags={() => {}}
          autocompleteOptions={formattedWhiteListTags}
          enableAutocomplete={true}
          placeholderWhenFull="タグは10個までです"
        />
        <div className="space-y-2 pt-2">
          <p className="text-sm">
            {"プロンプト付きの画像を読み込むとおすすめタグが更新されます"}
          </p>
          {props.recommendedTags.length !== 0 && (
            <div className="flex flex-wrap gap-2">
              {props.recommendedTags.map((tag) => (
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
