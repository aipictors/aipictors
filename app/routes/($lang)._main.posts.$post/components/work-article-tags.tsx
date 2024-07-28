import type { Tag } from "~/components/tag/tag-input"
import { Button } from "~/components/ui/button"
import { WorkTagInput } from "~/routes/($lang)._main.posts.$post/components/work-tag-input"
import { Link } from "@remix-run/react"
import { PlusIcon } from "lucide-react"
import React from "react"

type WorkArticleTagProps = {
  tagNames: string[]
  isEditable?: boolean
  postId: string
}

export const WorkArticleTags: React.FC<WorkArticleTagProps> = ({
  tagNames,
  isEditable = false,
  postId,
}) => {
  const [isOpenEdit, setIsOpenEdit] = React.useState(false)

  const [tags, setTags] = React.useState<Tag[]>([
    ...tagNames.map((tagName) => ({ id: tagName, text: tagName })),
  ])

  return (
    <>
      <div className="flex flex-row flex-wrap items-center space-x-4">
        {tagNames.map((tagName) => (
          <Link
            to={`https://www.aipictors.com/search/?tag=${tagName}`}
            key={tagName}
            className="p-0"
          >
            <Button className="p-0" variant={"link"}>{`#${tagName}`}</Button>
          </Link>
        ))}
        {isEditable && (
          <Button
            onClick={() => {
              setIsOpenEdit(!isOpenEdit)
            }}
            className="h-8 w-8"
            size={"icon"}
            variant={"ghost"}
          >
            <PlusIcon />
          </Button>
        )}
      </div>
      {isOpenEdit && (
        <WorkTagInput
          postId={postId}
          tags={tags}
          setTags={setTags}
          isEditable={true}
        />
      )}
    </>
  )
}
