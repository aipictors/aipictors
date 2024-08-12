import type { Tag } from "~/components/tag/tag-input"
import { Button } from "~/components/ui/button"
import { WorkTagInput } from "~/routes/($lang)._main.posts.$post/components/work-tag-input"
import { Link } from "@remix-run/react"
import { PlusIcon } from "lucide-react"
import React from "react"

type WorkArticleTagProps = {
  tagNames: string[]
  setTagNames: React.Dispatch<React.SetStateAction<string[]>>
  isEditable?: boolean
  postId: string
}

export const WorkArticleTags: React.FC<WorkArticleTagProps> = ({
  tagNames,
  isEditable = false,
  postId,
  setTagNames,
}) => {
  const [isOpenEdit, setIsOpenEdit] = React.useState(false)

  const [tags, setTags] = React.useState<Tag[]>([
    ...tagNames.map((tagName) => ({ id: tagName, text: tagName })),
  ])

  return (
    <>
      <div className="flex flex-row flex-wrap items-center gap-x-4">
        {tagNames.map((tagName) => (
          <Link to={`/tags/${tagName}`} key={tagName} className="p-0">
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
          setTagNames={setTagNames}
          tags={tags}
          setTags={setTags}
          isEditable={true}
          setIsOpenEdit={setIsOpenEdit}
        />
      )}
    </>
  )
}
