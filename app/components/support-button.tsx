/**
 * 推しボタン — ユーザーを支援する際に使用
 * - 指定コイン数に対する消費内訳と獲得ptのプレビュー表示
 * - ポイント不足時にコイン購入決済ができる
 */
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { CircleHelp, HeartHandshake, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  FreeSupportCoinIcon,
  PremiumSupportCoinIcon,
} from "~/components/support-coin-icons"
import { SupportSuccessDialog } from "~/components/support-success-dialog"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/purchase-premium-coins-dialog"

type Props = {
  targetUserId: string
  targetUserName?: string
  targetUserIconUrl?: string | null
  freeCoinBalance: number
  premiumCoinBalance: number
  onSuccess?: () => void
  triggerClassName?: string
  /** profile: マイページ用。目立つボタン 1 つにして、説明はダイアログの中に置く */
  variant?: "default" | "profile"
}

type CoinBreakdown = {
  totalCoinsUsed: number
  freeCoinsUsed: number
  premiumCoinsUsed: number
  totalPt: number
}

type SupportCoinType = "FREE" | "PREMIUM"

const calculateCustomCoinBreakdown = (
  freeCoinAmount: number,
  premiumCoinAmount: number,
  freeCoinBalance: number,
  premiumCoinBalance: number,
): CoinBreakdown | null => {
  if (!Number.isInteger(freeCoinAmount) || freeCoinAmount < 0) return null
  if (!Number.isInteger(premiumCoinAmount) || premiumCoinAmount < 0) return null

  const totalCoinsUsed = freeCoinAmount + premiumCoinAmount
  if (totalCoinsUsed <= 0) return null

  if (
    freeCoinAmount > freeCoinBalance ||
    premiumCoinAmount > premiumCoinBalance
  ) {
    return null
  }

  return {
    totalCoinsUsed,
    freeCoinsUsed: freeCoinAmount,
    premiumCoinsUsed: premiumCoinAmount,
    totalPt: freeCoinAmount + premiumCoinAmount * 10,
  }
}

/** よく使う枚数。プレミアムは 1 枚 10pt なので少なめ */
const COIN_OPTIONS: Record<SupportCoinType, readonly number[]> = {
  FREE: [10, 30, 100, 300],
  PREMIUM: [1, 3, 10, 30],
}

const parseClampedNonNegativeInt = (value: string, max: number) => {
  const numeric = Number.parseInt(value.replaceAll(/[^0-9]/g, ""), 10)
  if (Number.isNaN(numeric)) return ""
  return String(Math.min(Math.max(0, numeric), Math.max(0, max)))
}

export function SupportButton({
  targetUserId,
  targetUserName,
  targetUserIconUrl,
  freeCoinBalance,
  premiumCoinBalance,
  onSuccess,
  triggerClassName,
  variant = "default",
}: Props) {
  const t = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [coinType, setCoinType] = useState<SupportCoinType>("FREE")
  const [coinAmount, setCoinAmount] = useState<string>("10")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCoinPurchase, setShowCoinPurchase] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successThankYouMessage, setSuccessThankYouMessage] = useState("")
  const [successTotalPt, setSuccessTotalPt] = useState<number | null>(null)
  const isSubmittingRef = useRef(false)
  const [currentFreeCoinBalance, setCurrentFreeCoinBalance] =
    useState(freeCoinBalance)
  const [currentPremiumCoinBalance, setCurrentPremiumCoinBalance] =
    useState(premiumCoinBalance)

  const { data: targetUserData } = useQuery(targetSupportUserQuery, {
    variables: {
      userId: targetUserId,
    },
  })

  const resolvedTargetUser = targetUserData?.user
  const resolvedTargetUserName = resolvedTargetUser?.name ?? targetUserName
  const resolvedTargetUserIconUrl =
    resolvedTargetUser?.iconUrl ?? targetUserIconUrl
  const resolvedThankYouMessage =
    resolvedTargetUser?.supportThankYouMessage ??
    t(
      "応援してくれてありがとう！みんなのためにこれからも頑張るね！",
      "Thank you for your support! I will keep doing my best for everyone!",
    )

  useEffect(() => {
    setCurrentFreeCoinBalance(freeCoinBalance)
  }, [freeCoinBalance])

  useEffect(() => {
    setCurrentPremiumCoinBalance(premiumCoinBalance)
  }, [premiumCoinBalance])

  const reloadBalance = async () => {
    try {
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })
      const res = await fetch("/api/coins/summary", {
        method: "GET",
        headers,
      })

      const json = (await res.json()) as {
        error?: string
        data?: {
          freeBalance?: number
          premiumBalance?: number
        }
      }

      if (!res.ok || json.error || !json.data) {
        return
      }

      setCurrentFreeCoinBalance(json.data.freeBalance ?? 0)
      setCurrentPremiumCoinBalance(json.data.premiumBalance ?? 0)
    } catch {
      return
    }
  }

  const coinBalance =
    coinType === "FREE" ? currentFreeCoinBalance : currentPremiumCoinBalance
  const amount = Number(coinAmount) || 0

  const breakdown = calculateCustomCoinBreakdown(
    coinType === "FREE" ? amount : 0,
    coinType === "PREMIUM" ? amount : 0,
    currentFreeCoinBalance,
    currentPremiumCoinBalance,
  )
  const canSupport = breakdown !== null

  const selectCoinType = (nextType: SupportCoinType) => {
    setCoinType(nextType)
    const balance =
      nextType === "FREE" ? currentFreeCoinBalance : currentPremiumCoinBalance
    const first = COIN_OPTIONS[nextType][0]
    setCoinAmount(String(Math.min(first, balance)))
  }

  // 開いたときに、持っているコインで初期値を決める（残高が届いたら合わせ直す）
  const hasTouchedAmountRef = useRef(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: 開いたときと残高が変わったときだけ
  useEffect(() => {
    if (!isOpen) {
      hasTouchedAmountRef.current = false
      return
    }
    if (hasTouchedAmountRef.current) return
    selectCoinType(
      currentFreeCoinBalance === 0 && currentPremiumCoinBalance > 0
        ? "PREMIUM"
        : "FREE",
    )
    setIsAnonymous(false)
  }, [isOpen, currentFreeCoinBalance, currentPremiumCoinBalance])

  const handleSupport = async () => {
    if (!canSupport || !breakdown) return
    if (isSubmittingRef.current) return

    try {
      isSubmittingRef.current = true
      setIsLoading(true)
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })
      const requestId = crypto.randomUUID()

      // フリーコインとプレミアムコインに分割して送信
      const requests = []

      if (breakdown.freeCoinsUsed > 0) {
        requests.push(
          fetch("/api/coins/support", {
            method: "POST",
            headers,
            body: JSON.stringify({
              recipientUserId: targetUserId,
              coinType: "FREE",
              amount: breakdown.freeCoinsUsed,
              isAnonymous,
              source: `profile-support:${requestId}:FREE`,
            }),
          }),
        )
      }

      if (breakdown.premiumCoinsUsed > 0) {
        requests.push(
          fetch("/api/coins/support", {
            method: "POST",
            headers,
            body: JSON.stringify({
              recipientUserId: targetUserId,
              coinType: "PREMIUM",
              amount: breakdown.premiumCoinsUsed,
              isAnonymous,
              source: `profile-support:${requestId}:PREMIUM`,
            }),
          }),
        )
      }

      const responses = await Promise.all(requests)
      const jsonResponses = await Promise.all(
        responses.map(
          (res) =>
            res.json() as Promise<{
              error?: string
              data?: { success: boolean }
            }>,
        ),
      )

      const hasError =
        responses.some((res) => !res.ok) ||
        jsonResponses.some((json) => json.error)

      if (hasError) {
        const errorMsg = jsonResponses.find((j) => j.error)?.error
        if (errorMsg === "Insufficient coins") {
          setShowCoinPurchase(true)
        }
        toast.error(errorMsg ?? t("推しに失敗しました", "Support failed"))
        return
      }

      setCurrentFreeCoinBalance((current) =>
        Math.max(0, current - breakdown.freeCoinsUsed),
      )
      setCurrentPremiumCoinBalance((current) =>
        Math.max(0, current - breakdown.premiumCoinsUsed),
      )

      setSuccessThankYouMessage(resolvedThankYouMessage)
      setSuccessTotalPt(breakdown.totalPt)
      setIsSuccessOpen(true)
      setIsOpen(false)
      setIsAnonymous(false)
      onSuccess?.()
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message)
      }
    } finally {
      isSubmittingRef.current = false
      setIsLoading(false)
    }
  }

  const supportButtonClassName = triggerClassName
    ? triggerClassName.includes("w-full")
      ? triggerClassName.replace("w-full", "flex-1").trim()
      : triggerClassName
    : "flex-1"

  return (
    <>
      {variant === "profile" ? (
        <Button
          onClick={() => {
            void reloadBalance()
            setIsOpen(true)
          }}
          className={cn(
            "h-11 flex-1 gap-1.5 whitespace-nowrap rounded-full border-0 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 px-6 font-bold text-white shadow-md shadow-rose-500/25 transition hover:opacity-90 hover:shadow-lg hover:shadow-rose-500/30 active:scale-95 md:flex-none",
            triggerClassName,
          )}
        >
          <HeartHandshake className="size-4" />
          {t("推す", "Support")}
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
            aria-label={t("推すとは", "What is support?")}
            title={t("推すとは", "What is support?")}
            onClick={() => setIsInfoOpen(true)}
          >
            <CircleHelp className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => {
              void reloadBalance()
              setIsOpen(true)
            }}
            className={cn(
              supportButtonClassName,
              !triggerClassName && "w-full",
            )}
            variant="default"
          >
            {t("推す", "Support")}
          </Button>
        </div>
      )}

      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("推すとは", "What is support?")}</DialogTitle>
            <DialogDescription>
              {t(
                "お気に入りのクリエイターにコインを送って、支援や応援の気持ちを届ける機能です。",
                "Support lets you send coins to your favorite creators and show your appreciation.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              {t(
                "自分のお気に入りのクリエイターを支援・応援でき、送ったコインに応じて推し pt が加算されます。",
                "You can support your favorite creators, and sent coins are converted into support pt.",
              )}
            </p>
            <p className="text-muted-foreground">
              {t(
                "フリーコインは 1 coin = 1pt、プレミアムコインは 1 coin = 10pt として反映されます。",
                "Free coins count as 1pt each, and premium coins count as 10pt each.",
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-h-[90svh] w-[calc(100vw-1rem)] max-w-md overflow-y-auto"
          onOpenAutoFocus={(event) => {
            // 説明のボタンに枠が出てしまうので、最初はどこにも合わせない
            if (variant === "profile") event.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-6 text-left text-base">
              {resolvedTargetUserIconUrl && (
                <img
                  src={resolvedTargetUserIconUrl}
                  alt=""
                  className="size-10 shrink-0 rounded-full object-cover"
                />
              )}
              <span className="min-w-0 flex-1 break-words">
                {t(
                  `${resolvedTargetUserName || targetUserId} さんを推す`,
                  `Support ${resolvedTargetUserName || targetUserId}`,
                )}
              </span>
              {variant === "profile" && (
                <button
                  type="button"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label={t("推すとは", "What is support?")}
                  title={t("推すとは", "What is support?")}
                  onClick={() => setIsInfoOpen(true)}
                >
                  <CircleHelp className="size-4" />
                </button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 使うコイン */}
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    type: "FREE",
                    icon: <FreeSupportCoinIcon className="size-5" />,
                    label: t("フリーコイン", "Free coins"),
                    balance: currentFreeCoinBalance,
                    rate: t("1枚 = 1pt", "1 = 1pt"),
                  },
                  {
                    type: "PREMIUM",
                    icon: <PremiumSupportCoinIcon className="size-5" />,
                    label: t("プレミアム", "Premium"),
                    balance: currentPremiumCoinBalance,
                    rate: t("1枚 = 10pt", "1 = 10pt"),
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  type="button"
                  aria-pressed={coinType === item.type}
                  disabled={isLoading}
                  onClick={() => {
                    hasTouchedAmountRef.current = true
                    selectCoinType(item.type)
                  }}
                  className={cn(
                    "rounded-2xl border-2 p-3 text-left transition-colors",
                    coinType === item.type
                      ? "border-rose-500 bg-rose-500/5"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <span className="flex items-center gap-1.5 font-medium text-xs">
                    {item.icon}
                    {item.label}
                  </span>
                  <span className="mt-1 block font-bold text-lg tabular-nums leading-tight">
                    {item.balance.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {item.rate}
                  </span>
                </button>
              ))}
            </div>

            {/* 枚数 */}
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {COIN_OPTIONS[coinType].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={amount === option ? "default" : "outline"}
                    className="h-11 rounded-xl px-0 font-bold tabular-nums"
                    disabled={isLoading || option > coinBalance}
                    onClick={() => {
                      hasTouchedAmountRef.current = true
                      setCoinAmount(String(option))
                    }}
                  >
                    {option.toLocaleString()}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="support-amount"
                  className="shrink-0 text-muted-foreground text-xs"
                >
                  {t("枚数を入力", "Amount")}
                </Label>
                <Input
                  id="support-amount"
                  type="text"
                  inputMode="numeric"
                  value={coinAmount}
                  onChange={(event) => {
                    hasTouchedAmountRef.current = true
                    setCoinAmount(
                      parseClampedNonNegativeInt(
                        event.target.value,
                        coinBalance,
                      ),
                    )
                  }}
                  className="h-10 min-w-0 flex-1 text-right font-bold tabular-nums"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs"
                  disabled={isLoading || coinBalance === 0}
                  onClick={() => {
                    hasTouchedAmountRef.current = true
                    setCoinAmount(String(coinBalance))
                  }}
                >
                  {t("全部", "Max")}
                </Button>
              </div>
            </div>

            {coinBalance === 0 && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3 text-sm">
                <span>
                  {coinType === "PREMIUM"
                    ? t(
                        "プレミアムコインがありません",
                        "You have no premium coins",
                      )
                    : t("フリーコインがありません", "You have no free coins")}
                </span>
                {coinType === "PREMIUM" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => setShowCoinPurchase(true)}
                  >
                    {t("購入する", "Buy")}
                  </Button>
                )}
              </div>
            )}

            <label
              htmlFor="support-anonymous"
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                id="support-anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                disabled={isLoading}
              />
              {t("匿名で推す", "Support anonymously")}
            </label>

            <Button
              onClick={handleSupport}
              disabled={!canSupport || isLoading}
              className="h-12 w-full gap-1.5 rounded-full border-0 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 font-bold text-base text-white hover:opacity-90"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <HeartHandshake className="size-5" />
              )}
              {breakdown
                ? t(
                    `${breakdown.totalPt.toLocaleString()}pt 推す`,
                    `Send ${breakdown.totalPt.toLocaleString()}pt`,
                  )
                : t("枚数を選んでください", "Choose an amount")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PurchasePremiumCoinsDialog
        currentBalance={currentPremiumCoinBalance}
        open={showCoinPurchase}
        onOpenChange={(open) => {
          setShowCoinPurchase(open)
          if (!open) {
            void reloadBalance()
          }
        }}
        hideTrigger
      />

      <SupportSuccessDialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        targetUserIconUrl={resolvedTargetUserIconUrl}
        targetUserName={resolvedTargetUserName}
        thankYouMessage={successThankYouMessage}
        totalPt={successTotalPt ?? undefined}
      />
    </>
  )
}

const targetSupportUserQuery = graphql(
  `query TargetSupportUser($userId: ID!) {
    user(id: $userId) {
      id
      name
      iconUrl
      supportThankYouMessage
    }
  }`,
)
