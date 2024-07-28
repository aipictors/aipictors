import type React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TagList, type TagListProps } from "@/components/tag/tag-list"
import type { Tag as TagType } from "@/components/tag/tag-input"

type TagPopoverProps = {
  children: React.ReactNode
  tags: TagType[]
  customTagRenderer?: (tag: TagType) => React.ReactNode
} & TagListProps

export const TagPopover: React.FC<TagPopoverProps> = ({
  children,
  tags,
  customTagRenderer,
  ...tagProps
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-full space-y-3">
        <div className="space-y-1">
          <h4 className="font-medium text-sm leading-none">Entered Tags</h4>
          <p className="text-left text-muted-foreground text-sm">
            These are the tags you&apos;ve entered.
          </p>
        </div>
        <TagList
          tags={tags}
          customTagRenderer={customTagRenderer}
          {...tagProps}
        />
      </PopoverContent>
    </Popover>
  )
}
