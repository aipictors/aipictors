"use client"

import type { HotTagsQuery } from "@/__generated__/apollo"
import { TagButton } from "@/app/[lang]/(main)/_components/tag-button"

type Props = {
  hotTags: HotTagsQuery
}

/**
 * ホーム上部に
 * @param props
 * @returns
 */
export const HomeTagList = (props: Props) => {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <ul className="w-full space-x-2">
        {props.hotTags.hotTags?.map((tag) => (
          <TagButton key={tag.id} id={tag.id} name={tag.name} />
        ))}
        <div className="p-4" />
      </ul>
    </div>
  )
}
