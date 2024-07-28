import { type Tag, TagInput } from "~/components/tag/tag-input"
import React from "react"

type Props = {
  tags: Tag[]
  setTags: (tags: Tag[]) => void
}

export const MutedTagInput = (props: Props) => {
  const [tags, setTags] = React.useState<Tag[]>(props.tags)

  return (
    <div>
      <TagInput
        placeholder="非表示にしたいタグを追加してください"
        tags={tags}
        className="sm:min-w-[450px]"
        setTags={(newTags) => {
          setTags(newTags)
          props.setTags(newTags as [Tag, ...Tag[]])
        }}
      />
    </div>
  )
}
