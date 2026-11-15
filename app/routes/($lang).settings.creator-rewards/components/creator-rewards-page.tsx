import { Link, useSearchParams } from "@remix-run/react"
import { getAuth, getIdToken } from "firebase/auth"
import { ExternalLinkIcon, Loader2Icon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { AuthContext } from "~/contexts/auth-context"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import {
  CREATOR_REWARD_TERMS_VERSION,
  type CreatorRewardEarning,
  type CreatorRewardPayout,
  type CreatorRewardSummary,
  formatYen,
} from "~/lib/creator-rewards"

const formatDate = (sec: number | null | undefined) =>
  sec
    ? new Date(sec * 1000).toLocaleDateString("ja-JP", {
        timeZone: "Asia/Tokyo",
      })
    : "-"

const authHeaders = async () => {
  const user = getAuth().currentUser
  if (!user) throw new Error("login")
  return {
    authorization: `Bearer ${await getIdToken(user)}`,
    "content-type": "application/json",
  }
}

/**
 * クリエイター報酬（推しの換金）: 参加・明細・Stripe の口座登録
 */
export function CreatorRewardsPage() {
  const t = useTranslation()
  const locale = useLocale()
  const authContext = useContext(AuthContext)
  const [searchParams] = useSearchParams()
  const [summary, setSummary] = useState<CreatorRewardSummary | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    try {
      const res = await fetch("/api/creator-rewards", {
        headers: await authHeaders(),
      })
      const body = (await res.json()) as {
        error: string | null
        data: CreatorRewardSummary
      }
      if (!res.ok || body.error) throw new Error(body.error ?? "load")
      setSummary(body.data)
      setLoadError(false)
    } catch {
      setLoadError(true)
    }
  }

  const post = async (intent: string) => {
    setBusy(intent)
    try {
      const res = await fetch("/api/creator-rewards", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({
          intent,
          termsVersion: CREATOR_REWARD_TERMS_VERSION,
          lang: locale,
        }),
      })
      const body = (await res.json()) as {
        error: string | null
        data: { url?: string } | null
      }
      if (!res.ok || body.error) throw new Error(body.error ?? "error")
      if (body.data?.url) {
        window.location.href = body.data.url
        return
      }
      await load()
    } catch (e) {
      const code = e instanceof Error ? e.message : ""
      toast.error(
        code === "DISABLED"
          ? t("いまは受け付けを止めています", "Currently unavailable")
          : code === "ONBOARDING_NOT_AVAILABLE"
            ? t(
                "口座の登録は準備中です。報酬の記録は続いています",
                "Bank registration is not open yet. Rewards are still recorded",
              )
            : t("うまくいきませんでした", "Something went wrong"),
      )
    } finally {
      setBusy(null)
    }
  }

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn) return
    // Stripe の画面から戻ってきたときは口座の状態を取り直す
    if (searchParams.get("stripe") === "return") {
      post("refresh")
    } else {
      load()
    }
  }, [authContext.isLoading, authContext.isNotLoggedIn])

  if (authContext.isNotLoggedIn) {
    return (
      <Alert>
        <AlertDescription>
          {t("ログインしてください", "Please log in")}
        </AlertDescription>
      </Alert>
    )
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {t("読み込みに失敗しました", "Failed to load")}
        </AlertDescription>
      </Alert>
    )
  }

  if (!summary) {
    return (
      <div className="flex justify-center py-8">
        <Loader2Icon className="size-6 animate-spin" />
      </div>
    )
  }

  const c = summary.config
  const yenPer1000 = c.rateMilliyen // 1 枚あたりのミリ円 = 1,000 枚あたりの円
  const profile = summary.profile

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("クリエイター報酬", "Creator Rewards")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-7">
          <p>
            {t(
              `全年齢（一般・R15）の作品が、有料で購入されたプレミアムコインで推されると、1,000 コインにつき ${yenPer1000} 円の報酬が記録され、銀行口座へ振り込まれます（Stripe を利用）。`,
              `When your all-ages (G / R15) works are supported with purchased Premium Coins, you earn ¥${yenPer1000} per 1,000 coins, paid to your bank account via Stripe.`,
            )}
          </p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              {t(
                "R18・R18G の作品への推し、無料コイン・おまけのコインは対象外です（今までどおりコインで受け取ります）",
                "Supports on R18 / R18G works, free coins and bonus coins are not eligible (received as coins as before)",
              )}
            </li>
            <li>
              {t(
                `推されてから ${c.holdDays} 日たつと換金できるようになり、毎月 ${c.closeDay} 日に締めて振り込みます`,
                `Rewards become available ${c.holdDays} days after the support and are paid on the ${c.closeDay}th of each month`,
              )}
            </li>
            <li>
              {t(
                `振込は ${formatYen(c.minYen)} から（未満は繰り越し）、1 か月 ${formatYen(c.maxYen)} まで。振込手数料 ${formatYen(c.feeYen)} を差し引きます`,
                `Minimum payout ¥${c.minYen.toLocaleString()} (smaller amounts carry over), up to ¥${c.maxYen.toLocaleString()} per month. A ¥${c.feeYen} fee is deducted`,
              )}
            </li>
            <li>
              {t(
                `個人の方は所得税の源泉徴収（${(c.withholdingPpm / 10000).toFixed(2)}%）を差し引いて当社が納めます`,
                `For individuals, ${(c.withholdingPpm / 10000).toFixed(2)}% income tax is withheld and paid by us`,
              )}
            </li>
          </ul>
          <Link
            to="/creator-rewards/terms"
            className="text-blue-500 underline-offset-2 hover:underline"
          >
            {t("クリエイター報酬規約", "Creator Rewards Terms")}
          </Link>
        </CardContent>
      </Card>

      {!c.enabled && (
        <Alert>
          <AlertDescription>
            {t(
              "クリエイター報酬はいま受け付けを止めています",
              "Creator rewards are currently paused",
            )}
          </AlertDescription>
        </Alert>
      )}

      {(!summary.joined || profile?.needsNewTerms) && c.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {profile?.needsNewTerms
                ? t("規約が更新されました", "The terms have been updated")
                : t("参加する", "Join")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {t(
                "参加すると、参加したあとに受け取った対象の推しが報酬として記録されます（コインの残高には入りません）。報酬の受け取りは 18 歳以上の方に限ります。",
                "After joining, eligible supports you receive are recorded as rewards (not added to your coin balance). You must be 18 or older.",
              )}
            </p>
            <div className="flex items-center gap-2">
              <Checkbox
                id="creator-rewards-agree"
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
              />
              <label htmlFor="creator-rewards-agree">
                {t(
                  "クリエイター報酬規約に同意します",
                  "I agree to the Creator Rewards Terms",
                )}
              </label>
            </div>
            <Button
              disabled={!agreed || busy !== null}
              onClick={() => post("join")}
            >
              {busy === "join" && (
                <Loader2Icon className="mr-1 size-4 animate-spin" />
              )}
              {profile?.needsNewTerms
                ? t("同意して続ける", "Agree and continue")
                : t("同意して参加する", "Agree and join")}
            </Button>
          </CardContent>
        </Card>
      )}

      {summary.joined && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("振込先の口座", "Bank account")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {profile?.payoutReady ? (
              <>
                <p>
                  {t(
                    "口座の登録が済んでいます。",
                    "Your bank account is registered.",
                  )}
                  {profile.taxKind === "INDIVIDUAL" &&
                    t("（個人：源泉徴収あり）", " (individual: tax withheld)")}
                  {profile.taxKind === "CORPORATION" &&
                    t(
                      "（法人：源泉徴収なし）",
                      " (corporation: no withholding)",
                    )}
                </p>
                <Button
                  variant="secondary"
                  disabled={busy !== null}
                  onClick={() => post("dashboard")}
                >
                  {t("口座・本人確認を変更（Stripe）", "Manage on Stripe")}
                  <ExternalLinkIcon className="ml-1 size-4" />
                </Button>
              </>
            ) : summary.onboardingAvailable ? (
              <>
                <p className="text-muted-foreground">
                  {t(
                    "振込には Stripe での本人確認と口座の登録が必要です。登録は Stripe の画面で行い、Aipictors は口座番号を保存しません。",
                    "Payouts require identity verification and bank registration on Stripe. Aipictors does not store your bank details.",
                  )}
                </p>
                {profile?.requirements?.disabledReason && (
                  <p className="text-destructive">
                    {t(
                      "Stripe で追加の情報が必要です",
                      "Stripe needs more information",
                    )}
                  </p>
                )}
                <Button
                  disabled={busy !== null}
                  onClick={() => post("onboarding")}
                >
                  {busy === "onboarding" && (
                    <Loader2Icon className="mr-1 size-4 animate-spin" />
                  )}
                  {profile?.hasAccount
                    ? t("Stripe で登録を続ける", "Continue on Stripe")
                    : t("Stripe で口座を登録する", "Register on Stripe")}
                  <ExternalLinkIcon className="ml-1 size-4" />
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                {t(
                  "口座の登録は準備中です。開始したらお知らせします。それまでの報酬も記録され、登録後に振り込まれます。",
                  "Bank registration is coming soon. Rewards earned until then are recorded and will be paid after you register.",
                )}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {(summary.joined || summary.earnings.length > 0) && (
        <>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <BalanceTile
              label={t("保留中", "On hold")}
              value={summary.balances.holdingYen}
            />
            <BalanceTile
              label={t("換金できる", "Available")}
              value={summary.balances.availableYen}
            />
            <BalanceTile
              label={t("振込の手続き中", "Processing")}
              value={summary.balances.inPayoutYen}
            />
            <BalanceTile
              label={t("振込済み", "Paid")}
              value={summary.balances.paidYen}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            {t(
              `次の締め: ${formatDate(summary.nextCloseAt)}（その前の月末までに保留が明けた分）`,
              `Next closing: ${formatDate(summary.nextCloseAt)}`,
            )}
          </p>
          <PayoutList payouts={summary.payouts} />
          <EarningList earnings={summary.earnings} />
        </>
      )}

      {summary.joined && (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            disabled={busy !== null}
            onClick={() => {
              if (
                window.confirm(
                  t(
                    "参加をやめると、これからの推しはコインで受け取ります。記録済みの報酬はそのまま振り込まれます。やめますか？",
                    "After leaving, future supports are received as coins. Recorded rewards are still paid. Leave?",
                  ),
                )
              ) {
                post("leave")
              }
            }}
          >
            {t("参加をやめる", "Leave the program")}
          </Button>
        </div>
      )}
    </div>
  )
}

function BalanceTile(props: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-muted-foreground text-xs">{props.label}</div>
      <div className="font-bold text-lg">{formatYen(props.value)}</div>
    </div>
  )
}

function PayoutList(props: { payouts: CreatorRewardPayout[] }) {
  const t = useTranslation()
  const label: Record<CreatorRewardPayout["status"], string> = {
    AWAITING_APPROVAL: t("確認中", "Under review"),
    READY: t("振込予定", "Scheduled"),
    SENDING: t("送金中", "Sending"),
    SENT: t("送金済み", "Sent"),
    FAILED: t("失敗", "Failed"),
    CANCELED: t("取り消し", "Canceled"),
  }
  if (props.payouts.length === 0) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("振込", "Payouts")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {props.payouts.map((p) => (
          <div key={p.id} className="space-y-1 border-b pb-2 last:border-0">
            <div className="flex items-center justify-between">
              <span>{p.period}</span>
              <Badge variant="secondary">{label[p.status]}</Badge>
            </div>
            <div className="grid grid-cols-2 text-muted-foreground text-xs">
              <span>{t("報酬", "Rewards")}</span>
              <span className="text-right">{formatYen(p.grossYen)}</span>
              <span>{t("源泉徴収", "Withholding tax")}</span>
              <span className="text-right">-{formatYen(p.withholdingYen)}</span>
              <span>{t("振込手数料", "Fee")}</span>
              <span className="text-right">-{formatYen(p.feeYen)}</span>
              <span className="font-bold text-foreground">
                {t("振込額", "Net")}
              </span>
              <span className="text-right font-bold text-foreground">
                {formatYen(p.netYen)}
              </span>
            </div>
            {p.sentAt && (
              <div className="text-muted-foreground text-xs">
                {t("送金日", "Sent")}: {formatDate(p.sentAt)}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function EarningList(props: { earnings: CreatorRewardEarning[] }) {
  const t = useTranslation()
  const label: Record<CreatorRewardEarning["status"], string> = {
    HOLDING: t("保留中", "On hold"),
    HELD: t("換金できる", "Available"),
    IN_PAYOUT: t("手続き中", "Processing"),
    PAID: t("振込済み", "Paid"),
    REVERSED: t("取り消し", "Reversed"),
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("明細", "History")}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {props.earnings.length === 0 ? (
          <p className="text-muted-foreground">
            {t("まだ報酬はありません", "No rewards yet")}
          </p>
        ) : (
          <div className="divide-y">
            {props.earnings.map((e) => (
              <div key={e.id} className="flex items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <div>
                    {e.kind === "CLAWBACK" ? (
                      t("返金による差し引き", "Refund deduction")
                    ) : e.workId ? (
                      <Link
                        to={`/posts/${e.workId}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {t("作品への推し", "Support on work")}
                      </Link>
                    ) : (
                      t("プロフィールへの推し", "Profile support")
                    )}
                    <span className="ml-2 text-muted-foreground text-xs">
                      {e.coins.toLocaleString()} {t("コイン", "coins")}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatDate(e.createdAt)}
                    {e.status === "HOLDING" &&
                      t(
                        ` ・ ${formatDate(e.availableAt)} から換金できます`,
                        ` · available from ${formatDate(e.availableAt)}`,
                      )}
                  </div>
                </div>
                <Badge variant="outline">{label[e.status]}</Badge>
                <span className="w-20 text-right font-medium">
                  {formatYen(e.amountYen)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
