import { DownloadIcon, StampIcon } from "lucide-react"
import { type FragmentOf, graphql } from "gql.tada"
import { toResizedImageSrcSet, toResizedImageUrl } from "~/utils/resized-image-url"

type Props = {
  sticker: FragmentOf<typeof StickerCardFragment>
  /** 最初に見える行は遅延させない */
  isEager?: boolean
}

export function StickerCard (props: Props) {
  const title = props.sticker.title ?? "no title"

  return (
    <article className="group">
      <div className="overflow-hidden rounded-2xl bg-muted/60 transition group-hover:bg-muted">
        <img
          className="aspect-square w-full object-contain p-1.5 transition-transform duration-200 group-hover:scale-105"
          src={toResizedImageUrl(props.sticker.imageUrl, 240) ?? ""}
          srcSet={toResizedImageSrcSet(props.sticker.imageUrl, {
            minWidth: 160,
            maxWidth: 480,
          })}
          sizes="(min-width: 1024px) 180px, (min-width: 768px) 25vw, 33vw"
          width={240}
          height={240}
          alt={title}
          loading={props.isEager ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
      <h3 className="mt-1.5 truncate font-medium text-sm">{title}</h3>
      <p className="flex items-center gap-2.5 text-muted-foreground text-xs tabular-nums">
        <span className="flex items-center gap-0.5" title="DL">
          <DownloadIcon className="size-3" />
          {props.sticker.downloadsCount}
        </span>
        <span className="flex items-center gap-0.5" title="使用">
          <StampIcon className="size-3" />
          {props.sticker.usesCount}
        </span>
      </p>
    </article>
  )
}

export const StickerCardFragment = graphql(
  `fragment StickerCard on StickerNode @_unmask {
    id
    title
    imageUrl
    downloadsCount
    usesCount
  }`,
)
