import { Button } from "@/components/ui/button"
import Link from "next/link"
import React from "react"

type WorkArticleTagProps = {
  tagNames: string[]
}

const WorkArticleTags: React.FC<WorkArticleTagProps> = ({ tagNames }) => {
  return (
    <div className="flex flex-row flex-wrap">
      {tagNames.map((tagName) => (
        <Link href={`/tags/${tagName}`}>
          <Button key={tagName} variant={"link"}>{`#${tagName}`}</Button>
        </Link>
      ))}
    </div>
  )
}

export default WorkArticleTags
