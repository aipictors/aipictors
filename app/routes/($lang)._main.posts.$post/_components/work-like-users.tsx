import { Button } from "@/_components/ui/button"
import { Link } from "@remix-run/react"
import type React from "react"

type WorkArticleTagProps = {
  tagNames: string[]
}

export const WorkArticleTags: React.FC<WorkArticleTagProps> = ({
  tagNames,
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
    </div>
  )
}
