import { type Tag, TagInput } from "@/_components/tag/tag-input"
import { Button } from "@/_components/ui/button"
import { Card, CardContent } from "@/_components/ui/card"

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

  const getRandomId = () => {
    return Math.floor(Math.random() * 10000)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <p className="font-bold text-sm">{`タグ (${props.tags.length}/10)`}</p>
        <TagInput
          placeholder="タグを追加してください"
          tags={props.tags.map((tag) => ({
            id: tag.id,
            text: tag.text,
            label: tag.text,
            value: tag.text,
          }))}
          maxTags={10}
          maxLength={160}
          className="sm:min-w-[450px]"
          onTagAdd={(tag) =>
            props.onAddTag({ id: getRandomId().toString(), text: tag })
          }
          onTagRemove={(tag) =>
            props.onRemoveTag({
              id: props.tags.find((t) => t.text === tag)?.id ?? "",
              text: tag,
            })
          }
          setTags={() => {}}
          autocompleteOptions={whiteListTags.map((tag) => ({
            id: tag.id,
            text: tag.text,
            label: tag.text,
            value: tag.text,
          }))}
          enableAutocomplete={true}
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
