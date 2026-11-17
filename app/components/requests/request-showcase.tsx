import { BadgeCheck, ChevronRight, EyeOff, Loader2 } from "lucide-react"
import { useState } from "react"
import {
  RequestUserChip,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { type RequestShowcaseItem, requestsGet } from "~/lib/requests-api"
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
        {item.isR18 && (
          <span className="absolute top-2 right-2 rounded-full bg-rose-500 px-2 py-0.5 font-bold text-[11px] text-white">
            R18
          </span>
        )}
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

/** サイト共通の年齢の確認（ヘッダーの R18 切り替え・sensitive-age-gate と同じキー） */
const AGE_CONFIRMED_KEY = "ageConfirmed"
const AGE_CONFIRMED_SESSION_KEY = "ageConfirmedSession"

const readAgeConfirmed = () => {
  try {
    return (
      localStorage.getItem(AGE_CONFIRMED_KEY) === "true" ||
      sessionStorage.getItem(AGE_CONFIRMED_SESSION_KEY) === "true"
    )
  } catch {
    return false
  }
}

const writeAgeConfirmed = (remember: boolean) => {
  try {
    if (remember) localStorage.setItem(AGE_CONFIRMED_KEY, "true")
    else sessionStorage.setItem(AGE_CONFIRMED_SESSION_KEY, "true")
  } catch {}
}

/**
 * R18 の実績。最初は件数のボタンだけ出し、押して年齢を確かめてから（確認済みならそのまま）R18 の実績を読む。
 * 画像の URL は確認のあとまでページに含めない
 */
export function RequestShowcaseR18Section(props: {
  count: number
  planId?: string | null
  userId?: string | null
  users?: RequestUsers
  showCreator?: boolean
  scroll?: boolean
}) {
  const t = useTranslation()
  const [confirming, setConfirming] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<RequestShowcaseItem[] | null>(null)
  const [users, setUsers] = useState<RequestUsers>(props.users ?? {})

  if (props.count <= 0) return null

  const load = async () => {
    setLoading(true)
    try {
      const data = await requestsGet<{
        items: RequestShowcaseItem[]
        users: RequestUsers
      }>({
        op: "showcase",
        planId: props.planId,
        userId: props.planId ? null : props.userId,
        r18: 1,
        limit: 48,
      })
      setItems(data.items)
      setUsers((current) => ({ ...current, ...data.users }))
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const open = () => {
    if (readAgeConfirmed()) void load()
    else setConfirming(true)
  }

  if (items !== null) {
    return items.length === 0 ? null : (
      <RequestShowcaseGrid
        items={items}
        users={users}
        showCreator={props.showCreator}
        scroll={props.scroll}
      />
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="flex w-full items-center gap-3 rounded-2xl border border-rose-400/50 border-dashed bg-rose-500/5 p-3 text-left text-sm hover:bg-rose-500/10"
      >
        {loading ? (
          <Loader2 className="size-5 shrink-0 animate-spin text-rose-500" />
        ) : (
          <EyeOff className="size-5 shrink-0 text-rose-500" />
        )}
        <span className="flex-1">
          <b>
            {t(
              `R18 の実績が ${props.count} 件あります`,
              `${props.count} R18 work${props.count === 1 ? "" : "s"}`,
            )}
          </b>
          <span className="block text-muted-foreground text-xs">
            {t(
              "18 歳以上であることを確認してから表示します",
              "Shown after confirming you are 18 or older",
            )}
          </span>
        </span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </button>
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogTitle>{t("年齢の確認", "Age confirmation")}</DialogTitle>
          <p className="text-sm">
            {t(
              "R18 の作品が含まれます。あなたは 18 歳以上ですか？",
              "This includes R18 works. Are you 18 or older?",
            )}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={remember}
              onCheckedChange={(value) => setRemember(value === true)}
            />
            {t("次回から確認しない", "Don't ask again")}
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => setConfirming(false)}
            >
              {t("いいえ", "No")}
            </Button>
            <Button
              className="rounded-full font-bold"
              onClick={() => {
                writeAgeConfirmed(remember)
                setConfirming(false)
                void load()
              }}
            >
              {t("はい、18 歳以上です", "Yes, I am 18+")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
