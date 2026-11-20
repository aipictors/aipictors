import { useEffect, useRef, useState } from "react"
import { AppMarkdown } from "~/components/app/app-markdown"
import { ReleaseImageLightbox } from "~/components/release/release-image-lightbox"
import { ReleaseTagBadge } from "~/components/release-tag-badge"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  title: string
  description: string
  thumbnailUrl: string | null
  platform: string
  /** 投稿日（日本時間の YYYY.MM.DD） */
  dateText: string
  isNew: boolean
  tag?: string | null
}

/** 拡大できる画像（リンクの中の画像は、押したらリンク先へ行く） */
const ZOOMABLE_IMAGE_SELECTOR = "img:not(a img)"

/**
 * 本文の読みやすさ（AppMarkdown の既定は文字が薄いグレーで小さいので、記事として読める濃さ・大きさにする）
 */
const ARTICLE_BODY_CLASS_NAME = cn(
  "text-[15px] text-foreground leading-[1.9] md:text-base",
  "[&>p]:mb-5 [&>p]:text-foreground/90",
  "[&>ol>li]:text-foreground/90 [&>ol]:mb-5 [&>ul>li]:text-foreground/90 [&>ul]:mb-5 [&_li::marker]:text-primary [&_li]:my-1.5",
  "[&>h1]:mt-10 [&>h1]:mb-4 [&>h1]:border-none [&>h1]:pb-0 [&>h1]:text-xl md:[&>h1]:text-2xl",
  "[&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:border-primary [&>h2]:border-l-4 [&>h2]:py-0.5 [&>h2]:pl-3 [&>h2]:font-bold [&>h2]:text-lg md:[&>h2]:text-xl",
  "[&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:font-bold [&>h3]:text-base md:[&>h3]:text-lg",
  "[&_strong]:font-bold [&_strong]:text-foreground",
  "[&>blockquote]:rounded-r-lg [&>blockquote]:border-primary/40 [&>blockquote]:bg-muted/50 [&>blockquote]:py-2 [&>blockquote]:pr-3 [&>blockquote]:text-foreground/80 [&>blockquote]:not-italic",
  "[&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:shadow-sm",
  "[&_img:not(a_img)]:cursor-zoom-in [&_img:not(a_img)]:transition-opacity hover:[&_img:not(a_img)]:opacity-90",
  "[&_video]:my-6 [&_video]:max-w-full [&_video]:rounded-xl [&_video]:border",
  "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
  "[&_table]:my-5 [&_table]:w-full [&_table]:text-sm [&_td]:border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2",
)

/**
 * お知らせの本文
 * 画像を押すと拡大表示する（本文の画像とサムネイルをまとめて、前後に送れる）
 */
export function ReleaseItem(props: Props) {
  const t = useTranslation()
  const articleRef = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<{ src: string; alt: string }[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const zoomableImages = () =>
    Array.from(
      articleRef.current?.querySelectorAll<HTMLImageElement>(
        ZOOMABLE_IMAGE_SELECTOR,
      ) ?? [],
    )

  // 本文の画像をキーボードでも開けるようにする（本文は HTML として入るので、描いたあとに付ける）
  useEffect(() => {
    for (const image of zoomableImages()) {
      image.tabIndex = 0
      image.setAttribute("role", "button")
      image.setAttribute(
        "aria-label",
        `${image.alt || t("画像", "Image")}（${t("押すと拡大", "tap to enlarge")}）`,
      )
      if (!image.getAttribute("loading")) image.loading = "lazy"
    }
  }, [props.description, props.thumbnailUrl])

  const openImage = (target: EventTarget | null) => {
    if (!(target instanceof HTMLImageElement)) return false
    const list = zoomableImages()
    const index = list.indexOf(target)
    if (index === -1) return false
    setImages(
      list.map((image) => ({
        src: image.currentSrc || image.src,
        alt: image.alt,
      })),
    )
    setOpenIndex(index)
    return true
  }

  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="space-y-3 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {props.isNew && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 font-bold text-[11px] text-white tracking-wider">
              NEW
            </span>
          )}
          <ReleaseTagBadge
            tag={props.tag || props.platform || "お知らせ"}
            className="px-2 py-0.5 text-xs"
          />
          <time className="text-muted-foreground tabular-nums">
            {props.dateText}
          </time>
        </div>
        <h1 className="font-black text-2xl text-foreground leading-snug tracking-tight md:text-[2rem] md:leading-tight">
          {props.title}
        </h1>
      </header>
      <div
        ref={articleRef}
        className="rounded-2xl border bg-card px-5 py-6 shadow-sm md:px-10 md:py-9"
        onClick={(event) => {
          openImage(event.target)
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return
          if (openImage(event.target)) event.preventDefault()
        }}
      >
        {props.thumbnailUrl && (
          <img
            src={props.thumbnailUrl}
            alt={props.title}
            className="mb-8 w-full cursor-zoom-in rounded-xl border object-cover shadow-sm"
          />
        )}
        <AppMarkdown breaks className={ARTICLE_BODY_CLASS_NAME}>
          {props.description}
        </AppMarkdown>
      </div>
      <ReleaseImageLightbox
        images={images}
        index={openIndex}
        onChangeIndex={setOpenIndex}
      />
    </article>
  )
}
