import type { Tag } from "~/components/tag/tag-input"
import { Button } from "~/components/ui/button"
import { WorkTagInput } from "~/routes/($lang)._main.posts.$post._index/components/work-tag-input"
import { Link } from "@remix-run/react"
import { PlusIcon } from "lucide-react"
import React, { useEffect } from "react"

type Props = {
  tagNames: string[]
  setTagNames: React.Dispatch<React.SetStateAction<string[]>>
  isEditable?: boolean
  postId: string
}

export function WorkArticleTags(props: Props) {
  const [isOpenEdit, setIsOpenEdit] = React.useState(false)

  const [tags, setTags] = React.useState<Tag[]>([
    ...props.tagNames.map((tagName) => ({ id: tagName, text: tagName })),
  ])

  useEffect(() => {
    setTags([
      ...props.tagNames.map((tagName) => ({ id: tagName, text: tagName })),
    ])
  }, [props.tagNames])

  return (
    <>
      <div className="flex flex-row flex-wrap items-center gap-x-4">
        {props.tagNames.map((tagName) => (
          <Link to={`/tags/${tagName}`} key={tagName} className="p-0">
            <Button className="p-0" variant={"link"}>{`#${tagName}`}</Button>
          </Link>
        ))}
        {props.isEditable && (
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
          postId={props.postId}
          setTagNames={props.setTagNames}
          tags={tags}
          setTags={setTags}
          isEditable={true}
          setIsOpenEdit={setIsOpenEdit}
        />
      )}
    </>
  )
}
