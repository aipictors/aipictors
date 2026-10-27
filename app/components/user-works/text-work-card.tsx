import { Link } from "@remix-run/react"
import { HeartIcon } from "lucide-react"

type Props = {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string
  likesCount?: number | null
  createdAt?: number | null
}

/**
 * 小説・コラムのカード（表紙・タイトル・書き出し）
 */
export function TextWorkCard(props: Props) {
  const excerpt = (props.description ?? "").replace(/\s+/g, " ").trim()
  return (
    <Link
      to={`/posts/${props.id}`}
      className="group flex gap-4 rounded-2xl border bg-card p-3 transition-colors hover:bg-muted/50"
    >
      <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg bg-muted md:w-24">
        {props.thumbnailUrl && (
          <img
            src={props.thumbnailUrl}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
            width={96}
            height={128}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        <h3 className="line-clamp-2 font-bold text-sm leading-snug md:text-base">
          {props.title}
        </h3>
        {excerpt.length > 0 && (
          <p className="line-clamp-3 text-muted-foreground text-xs leading-relaxed md:text-sm">
            {excerpt}
          </p>
        )}
        {typeof props.likesCount === "number" && (
          <p className="mt-auto inline-flex items-center gap-1 text-muted-foreground text-xs">
            <HeartIcon className="size-3.5" />
            {props.likesCount.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  )
}
