import { type Tag, TagInput } from "@/_components/tag/tag-input"
import { Button } from "@/_components/ui/button"
import { Card, CardContent } from "@/_components/ui/card"

type Props = {
  tags: Tag[]
  whiteListTags: Tag[]
  setTags(value: Tag[]): void
  recommendedTags: Tag[]
}

/**
 * タグ入力
 */
export const PostFormItemTags = (props: Props) => {
  const whiteListTags = props.whiteListTags

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
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
          setTags={(newTags) => {
            props.setTags(newTags as [Tag, ...Tag[]])
            console.log(newTags)
          }}
          onFocus={() => {
            // setIsFocus(true)
          }}
          onBlur={() => {
            //setIsFocus(false)
          }}
          autocompleteOptions={whiteListTags.map((tag) => ({
            id: tag.id,
            text: tag.text,
            label: tag.text,
            value: tag.text,
          }))}
          enableAutocomplete={true}
        />
        <p className="mt-2 text-sm">
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
                  props.setTags([
                    ...props.tags,
                    {
                      id: tag.id,
                      text: tag.text,
                    },
                  ])
                }}
              >
                {tag.text}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
