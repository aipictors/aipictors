import { Link } from "@remix-run/react"
import { cn } from "~/lib/utils"
import { cva } from "class-variance-authority"

const galleryTagVariants = cva(
  "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 border",
  {
    variants: {
      variant: {
        default:
          "bg-background text-foreground border-border hover:bg-muted hover:border-muted-foreground/20",
        primary:
          "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80",
        outline:
          "bg-transparent text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        ghost:
          "bg-transparent text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "text-xs px-2 py-1 h-6",
        md: "text-sm px-3 py-1.5 h-8",
        lg: "text-base px-4 py-2 h-10",
      },
      interactive: {
        true: "cursor-pointer hover:shadow-sm hover:scale-105 active:scale-95",
        false: "cursor-default",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: true,
    },
  },
)

type GalleryTagProps = {
  text: string
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  href?: string
  onClick?: () => void
  className?: string
}

/**
 * ギャラリー専用のタグコンポーネント
 * クリック可能で検索機能と連携
 */
export function GalleryTag (props: GalleryTagProps): React.ReactNode {
  const {
    text,
    variant = "default",
    size = "md",
    interactive = true,
    href,
    onClick,
    className,
  } = props

  const tagClassName = cn(
    galleryTagVariants({ variant, size, interactive }),
    className,
  )

  // リンクがある場合はLinkコンポーネントを使用
  if (href && interactive) {
    return (
      <Link to={href} className={tagClassName}>
        {text}
      </Link>
    )
  }

  // クリックハンドラーがある場合はbuttonとして使用
  if (onClick && interactive) {
    return (
      <button type="button" onClick={onClick} className={tagClassName}>
        {text}
      </button>
    )
  }

  // インタラクティブでない場合はspanとして使用
  return <span className={tagClassName}>{text}</span>
}

type GalleryTagListProps = {
  tags: string[]
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onTagClick?: (tag: string) => void
  getTagHref?: (tag: string) => string
  className?: string
  maxTags?: number
}

/**
 * ギャラリー用のタグリスト
 */
export function GalleryTagList (props: GalleryTagListProps): React.ReactNode {
  const {
    tags,
    variant = "default",
    size = "md",
    interactive = true,
    onTagClick,
    getTagHref,
    className,
    maxTags,
  } = props

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags
  const remainingCount =
    maxTags && tags.length > maxTags ? tags.length - maxTags : 0

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displayTags.map((tag) => (
        <GalleryTag
          key={tag}
          text={tag}
          variant={variant}
          size={size}
          interactive={interactive}
          href={getTagHref?.(tag)}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        />
      ))}
      {remainingCount > 0 && (
        <GalleryTag
          text={`+${remainingCount}`}
          variant="ghost"
          size={size}
          interactive={false}
        />
      )}
    </div>
  )
}
