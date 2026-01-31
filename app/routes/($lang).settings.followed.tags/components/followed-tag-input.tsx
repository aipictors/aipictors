import { type Tag, TagInput } from "~/components/tag/tag-input"
import React from "react"

type Props = {
  tags: Tag[]
  setTags: (tags: Tag[]) => void
}

export function FollowedTagInput (props: Props) {
  const [tags, setTags] = React.useState<Tag[]>(props.tags)

  return (
    <div>
      <TagInput
        placeholder="フォローしたいタグを追加してください"
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
