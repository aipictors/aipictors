import { ToggleContent } from "@/_components/toggle-content"
import { Button } from "@/_components/ui/button"
import { Link } from "@remix-run/react"
import { PlusIcon } from "lucide-react"
import type React from "react"

type Tag = {
  id: string
  text: string
}

type WorkArticleTagProps = {
  tagNames: string[]
  isEditable?: boolean
}

export const WorkArticleTags: React.FC<WorkArticleTagProps> = ({
  tagNames,
  isEditable = false,
}) => {
  return (
    <div className="flex flex-row flex-wrap">
      {tagNames.map((tagName) => (
        <Link
          to={`https://www.aipictors.com/search/?tag=${tagName}`}
          key={tagName}
        >
          <Button variant={"link"}>{`#${tagName}`}</Button>
        </Link>
      ))}
      {isEditable && (
        <ToggleContent
          trigger={
            <Button className="h-8 w-8" size={"icon"} variant={"ghost"}>
              <PlusIcon />
            </Button>
          }
        >
          <div>{"メンテナンス中"}</div>
        </ToggleContent>
      )}
    </div>
  )
}
