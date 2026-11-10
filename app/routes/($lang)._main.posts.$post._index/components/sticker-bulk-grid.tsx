import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { StickerButtonFragment } from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"

const PER_PAGE = 120

type StickerItem = {
  id: string
  title: string
  imageUrl: string | null
}

type Props = {
  orderBy: "DATE_USED" | "DATE_CREATED"
  maxCount: number
  renderSticker: (sticker: StickerItem) => ReactNode
}

/**
 * 保存したスタンプを 1 つの一覧に続けて表示する（下まで送ると次を読む）
 */
export function StickerBulkGrid(props: Props) {
  const [pageCount, setPageCount] = useState(1)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const hasMore = pageCount * PER_PAGE < props.maxCount

  useEffect(() => {
    setPageCount(1)
  }, [props.orderBy])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPageCount((count) => count + 1)
        }
      },
      {
        // 一覧はダイアログの中でスクロールする。画面全体を基準にすると余白が効かず、一番下に着いてから読み始めて止まる
        root: sentinel.closest("[data-radix-scroll-area-viewport]"),
        rootMargin: "800px 0px",
      },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, pageCount])

  return (
    <>
      {Array.from({ length: pageCount }, (_, page) => (
        <StickerBulkPage
          // biome-ignore lint/suspicious/noArrayIndexKey: ページの番号がそのまま識別子になる
          key={page}
          offset={page * PER_PAGE}
          orderBy={props.orderBy}
          renderSticker={props.renderSticker}
        />
      ))}
      <div ref={sentinelRef} className="h-px w-full" />
    </>
  )
}

function StickerBulkPage(props: {
  offset: number
  orderBy: Props["orderBy"]
  renderSticker: Props["renderSticker"]
}) {
  const { data } = useQuery(viewerUserStickersBulkQuery, {
    variables: {
      limit: PER_PAGE,
      offset: props.offset,
      orderBy: props.orderBy,
    },
    fetchPolicy: "cache-first",
  })

  const stickers = data?.viewer?.userStickers

  if (!stickers) {
    // 読み込み中は先読みの範囲より大きく場所を取り、次のページを続けて読みに行かないようにする
    return <div className="h-[200vh] w-full animate-pulse rounded-md bg-muted" />
  }

  return <>{stickers.map((sticker) => props.renderSticker(sticker))}</>
}

const viewerUserStickersBulkQuery = graphql(
  `query ViewerUserStickersBulk($offset: Int!, $limit: Int!, $orderBy: StickerOrderBy) {
    viewer {
      id
      userStickers(offset: $offset, limit: $limit, orderBy: $orderBy) {
        ...StickerButton
      }
    }
  }`,
  [StickerButtonFragment],
)
