import React from "react"
import type { Tag as TagType } from "~/components/tag/tag-input"
import { cn } from "~/lib/utils"
import { Tag, type TagProps } from "~/components/tag/tag"

export type TagListProps = {
  tags: TagType[]
  customTagRenderer?: (tag: TagType) => React.ReactNode
  direction?: TagProps["direction"]
  onSortEnd: (oldIndex: number, newIndex: number) => void
} & Omit<TagProps, "tagObj">

const DropTarget: React.FC = () => {
  return <div className={cn("h-full rounded-md bg-secondary/50")} />
}

export function TagList({
  tags,
  customTagRenderer,
  direction,
  draggable,
  onSortEnd,
  ...tagListProps
}: TagListProps) {
  const [draggedTagId, setDraggedTagId] = React.useState<string | null>(null)

  const handleMouseDown = (id: string) => {
    setDraggedTagId(id)
  }

  const handleMouseUp = () => {
    setDraggedTagId(null)
  }

  if (tags.length === 0) {
    return null
  }

  return (
    <div
      className={cn("rounded-md", {
        "flex flex-wrap gap-2": direction === "row",
        "flex flex-col gap-2": direction === "column",
      })}
    >
      {draggable ? (
        <div className="list flex flex-wrap gap-2">
          {tags.map((tagObj) => (
            <div
              key={tagObj.id}
              onMouseDown={() => handleMouseDown(tagObj.id)}
              onMouseLeave={handleMouseUp}
              className={cn(
                {
                  "rounded-md border border-primary border-solid":
                    draggedTagId === tagObj.id,
                },
                "transition-all duration-200 ease-in-out",
              )}
            >
              {customTagRenderer ? (
                customTagRenderer(tagObj)
              ) : (
                <Tag tagObj={tagObj} {...tagListProps} />
              )}
            </div>
          ))}
        </div>
      ) : (
        tags.map((tagObj) =>
          customTagRenderer ? (
            customTagRenderer(tagObj)
          ) : (
            <Tag key={tagObj.id} tagObj={tagObj} {...tagListProps} />
          ),
        )
      )}
    </div>
  )
}
