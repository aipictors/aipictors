import { Link } from "@remix-run/react"
import { toResizedImageSrcSet } from "~/utils/resized-image-url"

type Props = {
  tagThumbnailUrl: string
  tagName: string
}

export function HomeTagsSectionItem (props: Props) {
  return (
    <div className="group relative overflow-hidden rounded-md">
      <Link to={`/tags/${props.tagName}`} className="rounded-md">
        <img
          className="h-[240px] w-[196px] bg-white object-cover object-center transition-transform duration-200 ease-in-out group-hover:scale-105"
          src={props.tagThumbnailUrl}
          // 元画像（100KB 前後）を 196×240 の枠に切り抜いて出すので、縮小版を選ばせる。
          // 横長の画像は高さに合わせて横にはみ出すので、幅は少し大きめ（240px）として選ぶ
          srcSet={toResizedImageSrcSet(props.tagThumbnailUrl, { minWidth: 240 })}
          sizes="240px"
          alt={props.tagName}
          width={196}
          height={240}
          // ページ下部の一覧なので後から読む（指定がなく、ページを開いた直後に 5 枚・約 300KB 読んでいた）
          loading="lazy"
          decoding="async"
        />
        <div className="absolute right-0 bottom-0 left-0 box-border flex h-16 flex-col justify-end bg-linear-to-t from-black to-transparent p-4 pb-3 opacity-88">
          <p className="text-white">{`#${props.tagName}`}</p>
        </div>
      </Link>
    </div>
  )
}
