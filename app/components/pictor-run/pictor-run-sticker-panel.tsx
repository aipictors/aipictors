import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ClockIcon, SparklesIcon } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { recordRecentStickerId } from "~/utils/sticker-recent"

export type PictorRunSticker = { id: string; url: string }

type Props = Readonly<{
  /** いま選んでいる（プレビュー中の）スタンプ */
  selected: PictorRunSticker | null
  /** 1 回押すとプレビュー、同じものをもう 1 回押すと送る */
  onSelect: (sticker: PictorRunSticker | null) => void
  onSend: (sticker: PictorRunSticker) => void
}>

type Tab = "DATE_USED" | "DATE_CREATED"

/**
 * チャットの入力欄の下にひらく、スタンプの一覧（LINE と同じ並び: 上にタブ、下にスタンプのマス目）。
 * 自分の持っているスタンプ（スタンプ広場で手に入れたもの）が出る
 */
export function PictorRunStickerPanel(props: Props): React.ReactNode {
  const t = useTranslation()
  const [tab, setTab] = useState<Tab>("DATE_USED")
  const { data, loading } = useQuery(stickersQuery, {
    variables: { offset: 0, limit: 80, orderBy: tab },
    errorPolicy: "all",
  })
  const stickers = data?.viewer?.userStickers ?? []
  const tabs: { value: Tab; label: string; icon: React.ReactNode }[] = [
    {
      value: "DATE_USED",
      label: t("よく使う順", "Recently used"),
      icon: <ClockIcon aria-hidden="true" className="size-5" />,
    },
    {
      value: "DATE_CREATED",
      label: t("新しい順", "Newest"),
      icon: <SparklesIcon aria-hidden="true" className="size-5" />,
    },
  ]

  return (
    <div className="mt-2 flex h-60 flex-col overflow-hidden rounded-xl bg-slate-100">
      <div className="flex shrink-0 items-center gap-1 border-slate-200 border-b bg-white px-2 py-1">
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={tab === item.value}
            aria-label={item.label}
            title={item.label}
            onClick={() => {
              setTab(item.value)
              props.onSelect(null)
            }}
            className={cn(
              "flex h-9 w-11 cursor-pointer items-center justify-center rounded-lg transition-colors",
              tab === item.value
                ? "bg-slate-200 text-slate-900"
                : "text-slate-400 hover:bg-slate-100",
            )}
          >
            {item.icon}
          </button>
        ))}
        <a
          href="/stickers"
          target="_blank"
          rel="noreferrer"
          className="ml-auto px-2 font-bold text-clear-bright-blue text-xs"
        >
          {t("スタンプをさがす", "Find stickers")}
        </a>
      </div>
      {stickers.length === 0 ? (
        <p className="flex flex-1 items-center justify-center px-6 text-center text-slate-500 text-sm">
          {loading
            ? t("読み込み中…", "Loading…")
            : t(
                "まだスタンプを持っていません。「スタンプをさがす」から手に入れられます。",
                "You have no stickers yet. Get some from “Find stickers”.",
              )}
        </p>
      ) : (
        <ul className="grid min-h-0 flex-1 grid-cols-4 content-start gap-1 overflow-y-auto overscroll-contain p-2">
          {stickers.map((sticker) => {
            if (!sticker.imageUrl) return null
            const item = { id: sticker.id, url: sticker.imageUrl }
            const isSelected = props.selected?.id === sticker.id
            return (
              <li key={sticker.id}>
                <button
                  type="button"
                  aria-label={sticker.title}
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (isSelected) {
                      recordRecentStickerId(sticker.id)
                      props.onSend(item)
                    } else {
                      props.onSelect(item)
                    }
                  }}
                  className={cn(
                    "flex aspect-square w-full cursor-pointer items-center justify-center rounded-lg p-1 transition-transform active:scale-90",
                    isSelected ? "bg-white shadow-sm" : "hover:bg-white/70",
                  )}
                >
                  <img
                    src={sticker.imageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-contain"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const stickersQuery = graphql(
  `query PictorRunViewerStickers($offset: Int!, $limit: Int!, $orderBy: StickerOrderBy) {
    viewer {
      id
      userStickers(offset: $offset, limit: $limit, orderBy: $orderBy) {
        id
        title
        imageUrl
      }
    }
  }`,
)
