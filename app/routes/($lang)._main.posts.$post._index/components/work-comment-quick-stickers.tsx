import { ChevronRightIcon, ClockIcon, LockIcon, PinIcon } from "lucide-react"
import type { ReactNode } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { toResizedImageUrl } from "~/utils/resized-image-url"

type QuickSticker = {
  id: string
  title: string
  imageUrl: string | null
  isUsable?: boolean | null
}

type Props = {
  pinnedStickers: QuickSticker[]
  recentStickers: QuickSticker[]
  disabled?: boolean
  onSend: (stickerId: string) => void
  onOpenAll: () => void
}

/**
 * 入力欄の下の「押すとすぐ送れるスタンプ」。ブックマークと最近使ったものを 1 つの枠にまとめ、
 * 段ごとに見出しを付けて横に流す（どちらも同じ大きさ）
 */
export function WorkCommentQuickStickers(props: Props) {
  const t = useTranslation()

  const onClickSticker = (sticker: QuickSticker) => {
    if (sticker.isUsable === false) {
      toast(
        t(
          "このスタンプは作者が非公開にしたため使えません。「設定 > スタンプ」の「マイスタンプ」から外せます",
          "This sticker is unavailable because the creator made it private. You can remove it in Settings > Stickers",
        ),
      )
      return
    }
    props.onSend(sticker.id)
  }

  const rows: {
    key: string
    icon: ReactNode
    label: string
    items: QuickSticker[]
  }[] = [
    {
      key: "pinned",
      icon: <PinIcon className="size-3" />,
      label: t("ブックマーク", "Bookmarked"),
      items: props.pinnedStickers.filter((sticker) => sticker.imageUrl),
    },
    {
      key: "recent",
      icon: <ClockIcon className="size-3" />,
      label: t("最近使った", "Recent"),
      items: props.recentStickers.filter((sticker) => sticker.imageUrl),
    },
  ]
  const visibleRows = rows.filter((row) => row.items.length > 0)

  if (visibleRows.length === 0) {
    return null
  }

  return (
    <section
      aria-label={t("すぐ送れるスタンプ", "Quick stickers")}
      className="mt-3 space-y-2 rounded-2xl bg-muted/50 px-2 pt-2 pb-1 md:ml-13"
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-[11px] text-muted-foreground">
          {t("タップですぐ送信されます", "Tap a sticker to send it")}
        </p>
        <button
          type="button"
          onClick={props.onOpenAll}
          disabled={props.disabled}
          className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium text-[11px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
        >
          {t("すべてのスタンプ", "All stickers")}
          <ChevronRightIcon className="size-3" />
        </button>
      </div>
      {visibleRows.map((row) => (
        <div key={row.key} className="space-y-0.5">
          <p className="flex items-center gap-1 px-1 font-medium text-[11px] text-muted-foreground">
            {row.icon}
            {row.label}
          </p>
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
            {row.items.map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                disabled={props.disabled}
                onClick={() => onClickSticker(sticker)}
                title={
                  sticker.isUsable === false
                    ? t(
                        "作者が非公開にしたため使えません",
                        "Unavailable: the creator made it private",
                      )
                    : sticker.title
                }
                aria-label={t(
                  `スタンプ「${sticker.title}」を送信`,
                  `Send sticker "${sticker.title}"`,
                )}
                className={cn(
                  "relative size-16 shrink-0 rounded-xl p-1 transition sm:size-[72px]",
                  "hover:bg-background hover:shadow-sm active:scale-95 disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                <img
                  className={cn(
                    "size-full object-contain",
                    sticker.isUsable === false && "opacity-35 grayscale",
                  )}
                  src={toResizedImageUrl(sticker.imageUrl ?? "", 240)}
                  alt={sticker.title}
                  loading="lazy"
                  decoding="async"
                />
                {sticker.isUsable === false && (
                  <span className="pointer-events-none absolute right-0.5 bottom-0.5 rounded-full bg-background/90 p-0.5 text-muted-foreground shadow-sm">
                    <LockIcon className="size-2.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
