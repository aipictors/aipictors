import { BadgeCheck, ChevronRight } from "lucide-react"
import { useState } from "react"
import {
  RequestUserChip,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import type { RequestShowcaseItem } from "~/lib/requests-api"
import { cn } from "~/lib/utils"

/**
 * 実績（有料リクエストで作られ、依頼者が公開を許可した作品）。
 * 画像はサーバーで透かしを入れたものだけ（元の納品画像の URL は当事者以外に出さない）
 */

/** プランで作られたことを示す印 */
export function RequestShowcaseBadge(props: { className?: string }) {
  const t = useTranslation()
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 font-bold text-[11px] text-white shadow-sm",
        props.className,
      )}
    >
      <BadgeCheck className="size-3" />
      {t("プランで制作", "Made via plan")}
    </span>
  )
}

/**
 * 実績の一覧（正方形のカード）。押すと透かし入りの画像を大きく見せる
 * showCreator: クリエイターのアイコンを出す（いろいろな人の実績を並べるとき）
 */
export function RequestShowcaseGrid(props: {
  items: RequestShowcaseItem[]
  users?: RequestUsers
  showCreator?: boolean
  /** 横にスクロールする 1 列（ユーザーページ） */
  scroll?: boolean
}) {
  const [open, setOpen] = useState<RequestShowcaseItem | null>(null)
  return (
    <>
      <div
        className={
          props.scroll
            ? "-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
            : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        }
      >
        {props.items.map((item) => (
          <ShowcaseCard
            key={item.requestId}
            item={item}
            user={
              props.showCreator ? props.users?.[item.creatorUserId] : undefined
            }
            className={props.scroll ? "w-40 shrink-0 snap-start" : undefined}
            onOpen={() => setOpen(item)}
          />
        ))}
      </div>
      <ShowcaseDialog
        item={open}
        user={open ? props.users?.[open.creatorUserId] : undefined}
        onClose={() => setOpen(null)}
      />
    </>
  )
}

function ShowcaseCard(props: {
  item: RequestShowcaseItem
  user?: RequestUsers[string]
  className?: string
  onOpen: () => void
}) {
  const t = useTranslation()
  const { item } = props
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", props.className)}>
      <button
        type="button"
        onClick={props.onOpen}
        className="relative aspect-square overflow-hidden rounded-2xl bg-muted transition-opacity hover:opacity-90"
      >
        {item.imageUrls[0] && (
          <img
            src={item.imageUrls[0]}
            alt={item.planTitle ?? t("リクエストの実績", "Request work")}
            className="size-full object-cover"
            loading="lazy"
            draggable={false}
            onContextMenu={(event) => event.preventDefault()}
          />
        )}
        <RequestShowcaseBadge className="absolute top-2 left-2" />
        {item.imageUrls.length > 1 && (
          <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">
            {item.imageUrls.length}
          </span>
        )}
      </button>
      {item.planTitle && (
        <p className="truncate text-muted-foreground text-xs">
          {t(`プラン「${item.planTitle}」`, `Plan "${item.planTitle}"`)}
        </p>
      )}
      {props.user && <RequestUserChip user={props.user} />}
    </div>
  )
}

function ShowcaseDialog(props: {
  item: RequestShowcaseItem | null
  user?: RequestUsers[string]
  onClose: () => void
}) {
  const t = useTranslation()
  const item = props.item
  return (
    <Dialog
      open={item !== null}
      onOpenChange={(open) => !open && props.onClose()}
    >
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl sm:max-w-2xl">
        <DialogTitle className="flex flex-wrap items-center gap-2 pr-6 text-base">
          <RequestShowcaseBadge />
          <span className="truncate">
            {item?.planTitle ?? t("リクエストの実績", "Request work")}
          </span>
        </DialogTitle>
        <div className="flex flex-col gap-3">
          {item?.imageUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              className="w-full rounded-2xl bg-muted object-contain"
              draggable={false}
              onContextMenu={(event) => event.preventDefault()}
            />
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          {t(
            "依頼者の許可を得て、透かしを入れて公開しています。",
            "Shown with a watermark, with the requester's permission.",
          )}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {props.user && <RequestUserChip user={props.user} size="md" />}
          {item?.planId && (
            <Link
              to={`/requests/plans/${item.planId}`}
              className="flex items-center font-bold text-sky-600 text-sm hover:underline dark:text-sky-400"
              onClick={props.onClose}
            >
              {t("このプランを見る", "View this plan")}
              <ChevronRight className="size-4" />
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
