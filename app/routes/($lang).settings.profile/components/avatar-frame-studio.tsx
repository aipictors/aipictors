import { useMutation } from "@apollo/client/index"
import { Link } from "~/lib/app/locale-router"
import { graphql } from "gql.tada"
import { Check, Crown, Loader2Icon, Lock, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { useCoinBalance } from "~/hooks/use-coin-balance"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { trackGrowthEvent } from "~/utils/track-growth-event"
import {
  filterUserAvatarFrames,
  isPlanExclusiveUserAvatarFrame,
  toUserAvatarFrameAccess,
  toUserAvatarFrameCategory,
  toUserAvatarFramePassLabel,
  USER_AVATAR_FRAME_CATEGORIES,
  type UserAvatarFrameCategory,
  type UserAvatarFrameKindFilter,
  type UserAvatarFramePassType,
  type UserAvatarFramePresentation,
} from "~/utils/user-avatar-frame"

type AvatarFrameItem = UserAvatarFramePresentation & {
  id: string
  slug: string
  name: string
  description?: string | null
  requiredPassType: string
  priceCoins?: number | null
}

type Props = {
  frames: AvatarFrameItem[]
  ownedFrameIds: string[]
  /** 今プロフィールに設定している枠 */
  appliedFrameId: string | null
  appliedFrame: AvatarFrameItem | null
  iconUrl?: string | null
  userName: string
  currentPassType: UserAvatarFramePassType
  onApplied: (frameId: string | null) => void
}

/**
 * プロフィールのアイコン枠の欄。今の枠と「枠を選ぶ」ボタンだけを出す
 */
export function AvatarFrameStudio(props: Props) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const isHiddenByPlan =
    props.appliedFrame !== null &&
    toUserAvatarFrameAccess(props.appliedFrame, {
      currentPassType: props.currentPassType,
      ownedFrameIds: props.ownedFrameIds,
    }) === "NEEDS_PLAN"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-4">
        <span className="flex size-20 shrink-0 items-center justify-center">
          <UserAvatarWithFrame
            alt=""
            frame={props.appliedFrame}
            isDecorationAnimated
            sizeClassName="size-14"
            src={props.iconUrl}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-sm">
            {props.appliedFrame?.name ?? t("枠なし", "No frame")}
          </p>
          {isHiddenByPlan && (
            <p className="text-amber-600 text-xs leading-5 dark:text-amber-400">
              {t(
                "今のプランでは表示されていません",
                "Not shown on your current plan",
              )}
            </p>
          )}
          <DialogTrigger asChild>
            <Button className="mt-1.5 h-10" variant="secondary">
              <Sparkles className="mr-2 size-4" />
              {t("枠を選ぶ", "Choose a frame")}
            </Button>
          </DialogTrigger>
        </div>
      </div>
      <DialogContent className="top-0 flex h-dvh max-h-dvh w-full max-w-none flex-col gap-0 overflow-hidden p-0 sm:top-[50%] sm:h-[88dvh] sm:max-h-[88dvh] sm:w-[calc(100%-2rem)] sm:max-w-5xl sm:rounded-xl">
        {isOpen && <StudioBody {...props} onClose={() => setIsOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function StudioBody(props: Props & { onClose: () => void }) {
  const t = useTranslation()
  const coins = useCoinBalance()
  const [previewId, setPreviewId] = useState<string | null>(
    props.appliedFrameId,
  )
  const [kind, setKind] = useState<UserAvatarFrameKindFilter>("ALL")
  const [category, setCategory] = useState<UserAvatarFrameCategory>("all")
  const [isDarkPreview, setIsDarkPreview] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [localOwnedIds, setLocalOwnedIds] = useState<string[]>([])
  const [spentCoins, setSpentCoins] = useState(0)

  const [purchase, { loading: isPurchasing }] = useMutation(
    purchaseUserAvatarFrameMutation,
  )
  const [applySetting, { loading: isApplying }] = useMutation(
    applyAvatarFrameMutation,
  )

  const ownedFrameIds = useMemo(
    () => [...props.ownedFrameIds, ...localOwnedIds],
    [props.ownedFrameIds, localOwnedIds],
  )
  const accessContext = {
    currentPassType: props.currentPassType,
    ownedFrameIds,
  }

  const previewFrame =
    props.frames.find((frame) => frame.id === previewId) ?? null
  const previewAccess =
    previewFrame === null
      ? "AVAILABLE"
      : toUserAvatarFrameAccess(previewFrame, accessContext)

  const kindFiltered = useMemo(
    () =>
      filterUserAvatarFrames(props.frames, {
        kind,
        category: "all",
        currentPassType: props.currentPassType,
        ownedFrameIds,
      }),
    [props.frames, kind, props.currentPassType, ownedFrameIds],
  )
  const visibleFrames =
    category === "all"
      ? kindFiltered
      : kindFiltered.filter(
          (frame) => toUserAvatarFrameCategory(frame.slug) === category,
        )
  // 「すべて」では、プラン限定の枠を先頭にまとめて見出しを付ける
  const planFrames =
    category === "all"
      ? visibleFrames.filter((frame) =>
          isPlanExclusiveUserAvatarFrame(frame.slug),
        )
      : []
  const otherFrames =
    planFrames.length === 0
      ? visibleFrames
      : visibleFrames.filter(
          (frame) => !isPlanExclusiveUserAvatarFrame(frame.slug),
        )
  const requiredPlanLabel = toUserAvatarFramePassLabel(
    previewFrame?.requiredPassType as UserAvatarFramePassType,
  )
  const categories = USER_AVATAR_FRAME_CATEGORIES.filter(
    (item) =>
      item.key === "all" ||
      kindFiltered.some(
        (frame) => toUserAvatarFrameCategory(frame.slug) === item.key,
      ),
  )

  const balance =
    coins.balance === null
      ? null
      : Math.max(
          0,
          coins.balance.freeCoinsBalance +
            coins.balance.premiumCoinsBalance -
            spentCoins,
        )
  const price = previewFrame?.priceCoins ?? 0
  const isAffordable = balance !== null && balance >= price

  const selectPreview = (frameId: string | null) => {
    setPreviewId(frameId)
    setIsConfirming(false)
  }

  const apply = async (frameId: string | null) => {
    try {
      await applySetting({
        variables: { input: { selectedUserAvatarFrameId: frameId } },
        refetchQueries: ["ProfileAvatarFrameSettings"],
        awaitRefetchQueries: true,
      })
      props.onApplied(frameId)
      toast.success(t("アイコン枠を変更しました", "Avatar frame updated"))
      return true
    } catch {
      toast.error(t("変更できませんでした", "Could not update"))
      return false
    }
  }

  const buyAndApply = async () => {
    if (previewFrame === null) return
    try {
      await purchase({
        variables: { input: { frameId: previewFrame.id } },
      })
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("購入できませんでした", "Could not purchase"),
      )
      return
    }
    setLocalOwnedIds((current) => [...current, previewFrame.id])
    setSpentCoins((current) => current + price)
    setIsConfirming(false)
    toast.success(
      t(
        `「${previewFrame.name}」を購入しました`,
        `Purchased "${previewFrame.name}"`,
      ),
    )
    await apply(previewFrame.id)
  }

  const isBusy = isPurchasing || isApplying
  const isApplied = previewId === props.appliedFrameId

  const kinds: { key: UserAvatarFrameKindFilter; label: string }[] = [
    { key: "ALL", label: t("すべて", "All") },
    { key: "SUBSCRIPTION", label: t("サブスク", "Plan") },
    { key: "COIN", label: t("コイン", "Coins") },
    { key: "OWNED", label: t("使える枠", "Available") },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
      {/* 試着: スマホは上、PC は左に固定 */}
      <section
        className={cn(
          "flex shrink-0 items-center gap-4 border-b p-3 pr-12 transition-colors sm:w-80 sm:flex-col sm:justify-center sm:gap-5 sm:border-r sm:border-b-0 sm:p-6",
          isDarkPreview ? "bg-[#1b1d23] text-white" : "bg-muted/40",
        )}
      >
        <span className="flex size-28 shrink-0 items-center justify-center sm:size-52">
          <UserAvatarWithFrame
            alt=""
            frame={previewFrame}
            isDecorationAnimated
            sizeClassName="size-[72px] sm:size-36"
            src={props.iconUrl}
          />
        </span>
        <div className="min-w-0 flex-1 sm:w-full sm:flex-none sm:text-center">
          <DialogTitle className="truncate text-base">
            {previewFrame?.name ?? t("枠なし", "No frame")}
          </DialogTitle>
          <DialogDescription
            className={cn(
              "line-clamp-2 text-xs leading-5",
              isDarkPreview && "text-white/70",
            )}
          >
            {previewFrame?.description ??
              t("アイコンをそのまま表示します", "Shows your icon as it is")}
          </DialogDescription>
          {/* コメント欄など、小さく出たときの見え方 */}
          <div className="mt-2 flex items-center gap-2 sm:justify-center">
            <span className="flex size-10 shrink-0 items-center justify-center">
              <UserAvatarWithFrame
                alt=""
                frame={previewFrame}
                isAnimated={false}
                sizeClassName="size-7"
                src={props.iconUrl}
              />
            </span>
            <span className="min-w-0 truncate font-medium text-xs">
              {props.userName}
            </span>
            <button
              type="button"
              aria-pressed={isDarkPreview}
              onClick={() => setIsDarkPreview((value) => !value)}
              className={cn(
                "ml-auto h-8 shrink-0 rounded-full border px-2.5 text-xs sm:ml-1",
                isDarkPreview && "border-white/30",
              )}
            >
              {isDarkPreview ? t("明るい背景", "Light") : t("暗い背景", "Dark")}
            </button>
          </div>
        </div>
      </section>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 space-y-2 border-b p-3 sm:pr-12">
          <div
            className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1"
            role="group"
            aria-label={t("枠の種類", "Frame type")}
          >
            {kinds.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={kind === item.key}
                onClick={() => {
                  setKind(item.key)
                  setCategory("all")
                }}
                className={cn(
                  "h-9 rounded-md text-sm transition-colors",
                  kind === item.key
                    ? "bg-background font-medium shadow-xs"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div
            className="-mx-1 flex gap-1 overflow-x-auto px-1"
            role="group"
            aria-label={t("枠の分類", "Frame categories")}
          >
            {categories.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={category === item.key}
                onClick={() => setCategory(item.key)}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 text-xs transition-colors",
                  category === item.key
                    ? "bg-foreground font-medium text-background"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {t(item.ja, item.en)}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          {planFrames.length > 0 && (
            <section className="mb-4">
              <h3 className="mb-2 flex flex-wrap items-baseline gap-x-2 font-medium text-sm">
                <span className="inline-flex items-center gap-1">
                  <Crown className="size-3.5 text-amber-500" />
                  {t("プラン限定", "Plan exclusive")}
                </span>
                <span className="font-normal text-muted-foreground text-xs">
                  {t(
                    "プランが上がるほど、豪華な枠を選べます",
                    "Higher plans unlock more luxurious frames",
                  )}
                </span>
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {planFrames.map((frame) => (
                  <FrameTile
                    key={frame.id}
                    badge={<FrameBadge frame={frame} {...accessContext} />}
                    isApplied={props.appliedFrameId === frame.id}
                    isPreview={previewId === frame.id}
                    label={frame.name}
                    onSelect={() => selectPreview(frame.id)}
                  >
                    <UserAvatarWithFrame
                      alt=""
                      frame={frame}
                      isAnimated={false}
                      sizeClassName="size-14"
                      src={props.iconUrl}
                    />
                  </FrameTile>
                ))}
              </div>
              <h3 className="mt-4 font-medium text-sm">
                {t("そのほかの枠", "More frames")}
              </h3>
            </section>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {kind !== "COIN" &&
              kind !== "SUBSCRIPTION" &&
              category === "all" && (
                <FrameTile
                  isApplied={props.appliedFrameId === null}
                  isPreview={previewId === null}
                  label={t("枠なし", "No frame")}
                  onSelect={() => selectPreview(null)}
                >
                  <UserAvatarWithFrame
                    alt=""
                    sizeClassName="size-14"
                    src={props.iconUrl}
                  />
                </FrameTile>
              )}
            {otherFrames.map((frame) => (
              <FrameTile
                key={frame.id}
                badge={<FrameBadge frame={frame} {...accessContext} />}
                isApplied={props.appliedFrameId === frame.id}
                isPreview={previewId === frame.id}
                label={frame.name}
                onSelect={() => selectPreview(frame.id)}
              >
                <UserAvatarWithFrame
                  alt=""
                  frame={frame}
                  isAnimated={false}
                  sizeClassName="size-14"
                  src={props.iconUrl}
                />
              </FrameTile>
            ))}
          </div>
          {visibleFrames.length === 0 && kind !== "ALL" && (
            <p className="py-12 text-center text-muted-foreground text-sm">
              {kind === "OWNED"
                ? t(
                    "使える枠はまだありません。気になる枠を押すと試着できます",
                    "No frames yet. Tap any frame to try it on",
                  )
                : t("該当する枠はありません", "No frames found")}
            </p>
          )}
        </div>

        {/* 操作はいつも同じ場所に出す */}
        <div className="shrink-0 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {isApplied ? (
            <Button
              className="h-11 w-full"
              onClick={props.onClose}
              variant="secondary"
            >
              <Check className="mr-2 size-4" />
              {t("使用中です。閉じる", "In use. Close")}
            </Button>
          ) : previewAccess === "AVAILABLE" ? (
            <Button
              className="h-11 w-full"
              disabled={isBusy}
              onClick={() => void apply(previewId)}
            >
              {isBusy && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              {previewFrame === null
                ? t("枠をはずす", "Remove frame")
                : t("この枠にする", "Use this frame")}
            </Button>
          ) : previewAccess === "NEEDS_PLAN" ? (
            <Button asChild className="h-11 w-full">
              <Link
                to="/plus"
                onClick={() =>
                  trackGrowthEvent("frame_plan_click", requiredPlanLabel)
                }
              >
                <Crown className="mr-2 size-4" />
                {t(
                  `${requiredPlanLabel} プランで使えます。プランを見る`,
                  `Available on ${requiredPlanLabel}. See plans`,
                )}
              </Link>
            </Button>
          ) : balance !== null && !isAffordable ? (
            <div className="space-y-2">
              <p className="text-center text-muted-foreground text-xs">
                {t(
                  `あと ${(price - balance).toLocaleString()} コイン足りません（保有 ${balance.toLocaleString()}）`,
                  `${(price - balance).toLocaleString()} more coins needed (you have ${balance.toLocaleString()})`,
                )}
              </p>
              <Button asChild className="h-11 w-full" variant="secondary">
                <Link to="/settings/points">
                  {t("コインを増やす", "Get more coins")}
                </Link>
              </Button>
            </div>
          ) : isConfirming ? (
            <div className="space-y-2">
              <p className="text-center text-sm tabular-nums">
                {t(
                  `${(balance ?? 0).toLocaleString()} → ${((balance ?? 0) - price).toLocaleString()} コイン。ずっと使えます`,
                  `${(balance ?? 0).toLocaleString()} → ${((balance ?? 0) - price).toLocaleString()} coins. Yours to keep`,
                )}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="h-11"
                  disabled={isBusy}
                  onClick={() => setIsConfirming(false)}
                  variant="secondary"
                >
                  {t("やめる", "Cancel")}
                </Button>
                <Button
                  className="h-11"
                  disabled={isBusy}
                  onClick={() => void buyAndApply()}
                >
                  {isBusy && (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  )}
                  {t("購入する", "Buy")}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="h-11 w-full"
              disabled={balance === null}
              onClick={() => setIsConfirming(true)}
            >
              <PremiumCoinIcon className="mr-2 size-4" />
              {t(
                `${price.toLocaleString()} コインで購入`,
                `Buy for ${price.toLocaleString()} coins`,
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function FrameBadge(props: {
  frame: AvatarFrameItem
  currentPassType: UserAvatarFramePassType
  ownedFrameIds: string[]
}) {
  const t = useTranslation()
  const access = toUserAvatarFrameAccess(props.frame, props)

  if (typeof props.frame.priceCoins === "number") {
    return access === "AVAILABLE" ? (
      <span className="text-emerald-600 dark:text-emerald-400">
        {t("購入済み", "Owned")}
      </span>
    ) : (
      <span className="inline-flex items-center gap-0.5 tabular-nums">
        <PremiumCoinIcon className="size-2.5" />
        {props.frame.priceCoins.toLocaleString()}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-0.5">
      {access === "AVAILABLE" ? (
        <Crown className="size-2.5" />
      ) : (
        <Lock className="size-2.5" />
      )}
      {toUserAvatarFramePassLabel(
        props.frame.requiredPassType as UserAvatarFramePassType,
      )}
    </span>
  )
}

function FrameTile(props: {
  label: string
  badge?: React.ReactNode
  isPreview: boolean
  isApplied: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={props.isPreview}
      onClick={props.onSelect}
      className={cn(
        "relative flex flex-col items-center gap-1 overflow-hidden rounded-xl border px-1 pt-5 pb-2 text-center transition-colors",
        props.isPreview
          ? "border-primary bg-primary/5 ring-2 ring-primary/40"
          : "hover:bg-muted/60",
      )}
    >
      {props.badge && (
        <span className="absolute top-1 left-1 z-10 rounded bg-background/90 px-1 py-0.5 text-[10px] text-muted-foreground leading-3">
          {props.badge}
        </span>
      )}
      {props.isApplied && (
        <span className="absolute top-1 right-1 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </span>
      )}
      {/* 装飾がアイコンの外にはみ出すぶんの余白 */}
      <span className="flex size-[84px] items-center justify-center">
        {props.children}
      </span>
      <span className="line-clamp-2 min-h-8 text-xs leading-4">
        {props.label}
      </span>
    </button>
  )
}

const purchaseUserAvatarFrameMutation = graphql(
  `mutation PurchaseUserAvatarFrame($input: PurchaseUserAvatarFrameInput!) {
    purchaseUserAvatarFrame(input: $input)
  }`,
)

const applyAvatarFrameMutation = graphql(
  `mutation ApplyUserAvatarFrame($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      id
      selectedUserAvatarFrame {
        id
      }
    }
  }`,
)
