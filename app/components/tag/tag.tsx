// https://github.com/JaleelB/emblor/blob/main/website/components/tag/tag.tsx

import { X } from "lucide-react"
import { Button } from "../ui/button"
import type { TagInputProps, Tag as TagType } from "./tag-input"
import { cn } from "~/lib/utils"
import { cva } from "class-variance-authority"

export const tagVariants = cva(
  "transition-all border inline-flex items-center text-sm pl-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        primary:
          "bg-primary border-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "text-xs h-7",
        md: "text-sm h-8",
        lg: "text-base h-9",
        xl: "text-lg h-10",
      },
      shape: {
        default: "rounded-sm",
        rounded: "rounded-lg",
        square: "rounded-none",
        pill: "rounded-full",
      },
      borderStyle: {
        default: "border-solid",
        none: "border-none",
      },
      textCase: {
        uppercase: "uppercase",
        lowercase: "lowercase",
        capitalize: "capitalize",
      },
      interaction: {
        clickable: "cursor-pointer hover:shadow-md",
        nonClickable: "cursor-default",
      },
      animation: {
        none: "",
        fadeIn: "animate-fadeIn",
        slideIn: "animate-slideIn",
        bounce: "animate-bounce",
      },
      textStyle: {
        normal: "font-normal",
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        lineThrough: "line-through",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "default",
      borderStyle: "default",
      interaction: "nonClickable",
      animation: "fadeIn",
      textStyle: "normal",
    },
  },
)

export type TagProps = {
  tagObj: TagType
  variant: TagInputProps["variant"]
  size: TagInputProps["size"]
  shape: TagInputProps["shape"]
  borderStyle: TagInputProps["borderStyle"]
  textCase: TagInputProps["textCase"]
  interaction: TagInputProps["interaction"]
  animation: TagInputProps["animation"]
  textStyle: TagInputProps["textStyle"]
  onRemoveTag: (id: string) => void
} & Pick<TagInputProps, "direction" | "onTagClick" | "draggable">

export function Tag({
  tagObj,
  direction,
  draggable,
  onTagClick,
  onRemoveTag,
  variant,
  size,
  shape,
  borderStyle,
  textCase,
  interaction,
  animation,
  textStyle,
}: TagProps) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <span
      key={tagObj.id}
      draggable={draggable}
      className={cn(
        tagVariants({
          variant,
          size,
          shape,
          borderStyle,
          textCase,
          interaction,
          animation,
          textStyle,
        }),
        {
          "justify-between": direction === "column",
          "cursor-pointer": draggable,
        },
      )}
      onClick={() => onTagClick?.(tagObj)}
    >
      {tagObj.text}
      <Button
        type="button"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation() // Prevent event from bubbling up to the tag span
          onRemoveTag(tagObj.id)
        }}
        className={cn("h-full px-3 py-1 hover:bg-transparent")}
      >
        <X size={14} />
      </Button>
    </span>
  )
}
