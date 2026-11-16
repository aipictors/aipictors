import { Link, useSearchParams } from "@remix-run/react"
import { getAuth, getIdToken } from "firebase/auth"
import {
  ArrowRightIcon,
  BanknoteIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  GlobeIcon,
  IdCardIcon,
  LandmarkIcon,
  Loader2Icon,
  ShieldCheckIcon,
  SmartphoneIcon,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { AuthContext } from "~/contexts/auth-context"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import {
  CREATOR_REWARD_TERMS_VERSION,
  type CreatorRewardEarning,
  type CreatorRewardPayout,
  type CreatorRewardSummary,
  formatCloseDays,
  formatYen,
} from "~/lib/creator-rewards"
import { cn } from "~/lib/utils"

const formatDate = (sec: number | null | undefined, isEnglish = false) =>
  sec
    ? new Date(sec * 1000).toLocaleDateString(isEnglish ? "en-US" : "ja-JP", {
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
 * クリエイター報酬（推しの換金）: しくみ・3 ステップ（参加 → 口座の登録 → 自動で振込）・明細。専門用語を使わず、Stripe の名前は安全の説明だけに出す
 */
export function CreatorRewardsPage() {
  const t = useTranslation()
  const locale = useLocale()
  const authContext = useContext(AuthContext)
  const [searchParams] = useSearchParams()
  const [summary, setSummary] = useState<CreatorRewardSummary | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [hasJapanBank, setHasJapanBank] = useState(false)
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
            : t(
                "うまくいきませんでした。時間をおいてもう一度押してください。続くときはお問い合わせからご連絡ください",
                "Something went wrong. Please try again later, or contact us if it keeps happening",
              ),
      )
    } finally {
      setBusy(null)
    }
  }

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn) return
    // 口座の登録画面（Stripe）から戻ってきたときは口座の状態を取り直す
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
  const closeDaysText = formatCloseDays(c)
  // いまどこまで進んでいるか（1: 参加する → 2: 振込先を登録する → 3: あとは待つだけ）
  const step = !summary.joined ? 1 : profile?.payoutReady ? 3 : 2
  const needsMore = !!profile?.requirements?.disabledReason

  return (
    <div className="space-y-4">
      {/* しくみを一言で */}
      <section className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-transparent p-5">
        <p className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 text-xs dark:text-emerald-300">
          <BanknoteIcon className="size-4" />
          {t("収益の受け取り", "Rewards payout")}
        </p>
        <h2 className="mt-1 font-bold text-xl leading-snug">
          {t(
            "推してもらったコインが、お金になって振り込まれます",
            "Support you receive turns into money in your bank",
          )}
        </h2>
        <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-background/80 p-4">
          <div className="text-center">
            <PremiumCoinIcon className="mx-auto size-8" />
            <p className="mt-1 font-bold text-lg tabular-nums">1,000</p>
            <p className="text-muted-foreground text-xs">
              {t("買ったコインで推される", "purchased coins")}
            </p>
          </div>
          <ArrowRightIcon className="size-6 shrink-0 text-muted-foreground" />
          <div className="text-center">
            <BanknoteIcon className="mx-auto size-8 text-emerald-600" />
            <p className="mt-1 font-bold text-emerald-700 text-lg tabular-nums dark:text-emerald-300">
              {formatYen(yenPer1000, t.isEnglish)}
            </p>
            <p className="text-muted-foreground text-xs">
              {t("あなたの口座へ", "to your bank")}
            </p>
          </div>
        </div>
        <p className="mt-3 text-muted-foreground text-xs leading-5">
          {t(
            "対象は全年齢（一般・R15）の作品への推しで、ファンがお金を払って買ったコインの分です。無料でもらったコインやR18の作品への推しは、今までどおりコインで受け取ります。",
            "Covers supports on all-ages (G / R15) works paid with coins fans bought. Free coins and supports on R18 works are received as coins as before.",
          )}
        </p>
      </section>

      {!summary.joined && <JapanBankOnlyNotice />}

      {!c.enabled && (
        <Alert>
          <AlertDescription>
            {t(
              "いまは受け付けを止めています",
              "Creator rewards are currently paused",
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 受け取れるお金 */}
      {(summary.joined || summary.earnings.length > 0) && (
        <section className="space-y-2">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <BalanceTile
              label={t("確認期間中", "Checking")}
              hint={t(`推されてから${c.holdDays}日`, `${c.holdDays} days`)}
              value={summary.balances.holdingYen}
            />
            <BalanceTile
              label={t("次の振込に入る", "Next payout")}
              hint={t(
                `${formatDate(summary.nextCloseAt, t.isEnglish)} に締め`,
                `Closes ${formatDate(summary.nextCloseAt, t.isEnglish)}`,
              )}
              value={summary.balances.availableYen}
              accent
            />
            <BalanceTile
              label={t("振込の準備中", "Processing")}
              value={summary.balances.inPayoutYen}
            />
            <BalanceTile
              label={t("これまでに振込", "Paid so far")}
              value={summary.balances.paidYen}
            />
          </div>
        </section>
      )}

      {/* 3 つのステップ */}
      {c.enabled && (
        <section className="rounded-2xl border bg-card p-4 md:p-5">
          <h3 className="font-bold">
            {t("受け取りまでの 3 ステップ", "3 steps to get paid")}
          </h3>
          <ol className="mt-4 space-y-4">
            <StepItem
              n={1}
              state={step > 1 ? "done" : "current"}
              title={t("参加する（無料）", "Join (free)")}
            >
              {step === 1 || profile?.needsNewTerms ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm leading-6">
                    {profile?.needsNewTerms
                      ? t(
                          "ルール（規約）が新しくなりました。確認して同意してください。",
                          "The terms have been updated. Please review and agree.",
                        )
                      : t(
                          "参加したあとにもらった推しから、お金として記録されます。18歳以上の方が対象です。",
                          "Supports you receive after joining are recorded as money. You must be 18 or older.",
                        )}
                  </p>
                  <label
                    htmlFor="creator-rewards-agree"
                    className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm"
                  >
                    <Checkbox
                      id="creator-rewards-agree"
                      className="mt-0.5"
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(v === true)}
                    />
                    <span>
                      <Link
                        to="/creator-rewards/terms"
                        className="text-blue-500 underline underline-offset-2"
                      >
                        {t(
                          "ルール（クリエイター報酬規約）",
                          "the Creator Rewards Terms",
                        )}
                      </Link>
                      {t(" を読んで同意します", "— I have read and agree")}
                    </span>
                  </label>
                  {!summary.joined && (
                    <label
                      htmlFor="creator-rewards-japan-bank"
                      className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm"
                    >
                      <Checkbox
                        id="creator-rewards-japan-bank"
                        className="mt-0.5"
                        checked={hasJapanBank}
                        onCheckedChange={(v) => setHasJapanBank(v === true)}
                      />
                      <span>
                        {t(
                          "日本の銀行口座（円）と日本の住所で登録できます",
                          "I have a bank account in Japan (JPY) and a Japanese address",
                        )}
                      </span>
                    </label>
                  )}
                  <Button
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={
                      !agreed ||
                      (!summary.joined && !hasJapanBank) ||
                      busy !== null
                    }
                    onClick={() => post("join")}
                  >
                    {busy === "join" && (
                      <Loader2Icon className="mr-1 size-4 animate-spin" />
                    )}
                    {profile?.needsNewTerms
                      ? t("同意して続ける", "Agree and continue")
                      : t("同意して参加する", "Agree and join")}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("参加しています", "You have joined")}
                </p>
              )}
            </StepItem>

            <StepItem
              n={2}
              state={step > 2 ? "done" : step === 2 ? "current" : "todo"}
              title={t(
                "お金を受け取る口座を登録する",
                "Add the bank account to receive money",
              )}
            >
              {step === 3 ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    {t("登録が済んでいます", "Your bank account is registered")}
                    {profile?.taxKind === "INDIVIDUAL" &&
                      t("（個人）", " (individual)")}
                    {profile?.taxKind === "CORPORATION" &&
                      t("（法人）", " (company)")}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => post("dashboard")}
                  >
                    {t(
                      "口座や登録内容を変える",
                      "Change bank account or details",
                    )}
                    <ExternalLinkIcon className="ml-1 size-4" />
                  </Button>
                </div>
              ) : step === 2 && summary.onboardingAvailable ? (
                <div className="space-y-3">
                  {needsMore && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {t(
                          "登録の途中です。下のボタンから続きを入力してください。",
                          "Registration isn't finished. Continue with the button below.",
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  <p className="text-muted-foreground text-sm leading-6">
                    {t(
                      "ボタンを押すと入力の画面に進みます。5〜10分ほどで終わります。",
                      "The button opens a form. It takes about 5–10 minutes.",
                    )}
                  </p>
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <p className="font-semibold">
                      {t("用意するもの", "What you need")}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      <NeedItem icon={SmartphoneIcon}>
                        {t(
                          "スマホ（電話番号に確認のメッセージが届きます）",
                          "Your phone (for a text message code)",
                        )}
                      </NeedItem>
                      <NeedItem icon={LandmarkIcon}>
                        {t(
                          "日本の銀行口座（通帳かキャッシュカードがあると安心）",
                          "A bank account in Japan (JPY) and a Japanese address",
                        )}
                      </NeedItem>
                      <NeedItem icon={IdCardIcon}>
                        {t(
                          "本人確認の書類（運転免許証・マイナンバーカードなど）",
                          "ID (driver's license, My Number card, etc.)",
                        )}
                      </NeedItem>
                    </ul>
                  </div>
                  <Button
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={busy !== null}
                    onClick={() => post("onboarding")}
                  >
                    {busy === "onboarding" && (
                      <Loader2Icon className="mr-1 size-4 animate-spin" />
                    )}
                    {profile?.hasAccount
                      ? t("口座の登録を続ける", "Continue registration")
                      : t("口座を登録する", "Add bank account")}
                    <ChevronRightIcon className="ml-1 size-4" />
                  </Button>
                  <p className="flex items-start gap-1.5 text-muted-foreground text-xs leading-5">
                    <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    {t(
                      "入力の画面は、世界中で使われている送金サービス「Stripe（ストライプ）」の安全なページです。英語のロゴが出ても大丈夫です。口座番号は Aipictors には保存されません。",
                      "The form is a secure page by Stripe, a payment service used worldwide. Aipictors never stores your bank number.",
                    )}
                  </p>
                </div>
              ) : step === 2 ? (
                <p className="text-muted-foreground text-sm leading-6">
                  {t(
                    "口座の登録はもうすぐ始まります。それまでの分もきちんと記録され、登録したあとに振り込まれます。",
                    "Bank registration opens soon. Rewards until then are recorded and paid after you register.",
                  )}
                </p>
              ) : null}
            </StepItem>

            <StepItem
              n={3}
              state={step === 3 ? "current" : "todo"}
              title={t("あとは待つだけ", "Then just wait")}
            >
              <p className="text-muted-foreground text-sm leading-6">
                {t(
                  `毎月 ${closeDaysText} 日にまとめて、自動で口座に振り込みます。手続きはいりません。`,
                  `Paid automatically on day ${(c.closeDays ?? [c.closeDay]).join(" and ")} of each month. Nothing else to do.`,
                )}
              </p>
            </StepItem>
          </ol>
        </section>
      )}

      {(summary.joined || summary.earnings.length > 0) && (
        <>
          <PayoutList payouts={summary.payouts} />
          <EarningList earnings={summary.earnings} />
        </>
      )}

      {/* くわしい条件（たたんでおく） */}
      <details className="group rounded-2xl border bg-card p-4 text-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
          {t("くわしい条件・よくある質問", "Details & FAQ")}
          <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <dl className="mt-3 space-y-3 leading-6">
          <FaqItem q={t("いつ振り込まれますか？", "When am I paid?")}>
            {t(
              `推されてから ${c.holdDays} 日の確認期間のあと、毎月 ${closeDaysText} 日にまとめて振り込みます。`,
              `After a ${c.holdDays}-day check period, on day ${(c.closeDays ?? [c.closeDay]).join(" and ")} of each month.`,
            )}
          </FaqItem>
          <FaqItem q={t("いくらから振り込まれますか？", "Is there a minimum?")}>
            {t(
              `${formatYen(c.minYen, t.isEnglish)} 以上たまったら振り込みます（それまでは次回に持ち越し）。1か月 ${formatYen(c.maxYen, t.isEnglish)} までです。`,
              `Paid once you have ¥${c.minYen.toLocaleString()} or more (otherwise carried over). Up to ¥${c.maxYen.toLocaleString()} per month.`,
            )}
            {c.newAccountMaxYen && c.newAccountDays
              ? t(
                  `口座を登録してから ${c.newAccountDays} 日のあいだは、1回 ${formatYen(c.newAccountMaxYen, t.isEnglish)} までです。`,
                  ` For the first ${c.newAccountDays} days after registering, up to ¥${c.newAccountMaxYen.toLocaleString()} per payout.`,
                )
              : ""}
          </FaqItem>
          <FaqItem
            q={t("差し引かれるお金はありますか？", "Are there deductions?")}
          >
            {t(
              `振込のたびに手数料 ${formatYen(c.feeYen, t.isEnglish)} がかかります。個人の方は、法律で決まった所得税（${(c.withholdingPpm / 10000).toFixed(2)}%）を差し引き、Aipictors が代わりに国へ納めます（源泉徴収）。`,
              `A ¥${c.feeYen} fee per payout. For individuals, ${(c.withholdingPpm / 10000).toFixed(2)}% income tax is withheld and paid to the government by us.`,
            )}
          </FaqItem>
          <FaqItem q={t("口座の情報は安全ですか？", "Is my bank info safe?")}>
            {t(
              "口座や本人確認の情報は、世界中のネットショップで使われている送金サービス Stripe が管理します。Aipictors は口座番号を保存しません。",
              "Your bank and ID details are kept by Stripe, a payment service used by online shops worldwide. Aipictors never stores your bank number.",
            )}
          </FaqItem>
          <FaqItem
            q={t(
              "コインの残高はどうなりますか？",
              "What about my coin balance?",
            )}
          >
            {t(
              "お金として記録された分は、コインの残高には入りません。対象外の推しは、今までどおりコインで受け取ります。",
              "Amounts recorded as money are not added to your coins. Other supports are received as coins as before.",
            )}
          </FaqItem>
        </dl>
        <Link
          to="/creator-rewards/terms"
          className="mt-3 inline-block text-blue-500 underline-offset-2 hover:underline"
        >
          {t(
            "クリエイター報酬規約（ルールの全文）",
            "Creator Rewards Terms (full text)",
          )}
        </Link>
      </details>

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
                    "参加をやめると、これからの推しはコインで受け取ります。記録済みのお金はそのまま振り込まれます。やめますか？",
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

/**
 * 振込は日本の銀行口座（円）だけ。日本の Stripe からは海外の口座へ送れない（cross-border payouts は米・英・EEA・加・瑞のプラットフォームだけ）。
 * 海外の方は参加しなければ、推しは今までどおりコインで届く（参加すると全年齢の有料コインの推しが円の報酬になり、口座がないと受け取れない）
 */
export function JapanBankOnlyNotice() {
  const t = useTranslation()
  return (
    <Alert>
      <GlobeIcon className="size-4" />
      <AlertDescription className="space-y-1 text-sm leading-6">
        <p className="font-semibold">
          {t(
            "振込先は日本の銀行口座（円）だけです",
            "Payouts are only available to bank accounts in Japan (JPY)",
          )}
        </p>
        <p className="text-muted-foreground">
          {t(
            "海外にお住まいで日本の口座がない方は、参加しないでください。参加しなければ、推しはこれまでどおりコインで受け取れます。推し・リクエスト・プランはコインなので、どの国からでも使えます。",
            "If you live outside Japan and don't have a Japanese bank account, please don't join. Without joining, you keep receiving supports as coins. Supports, requests and plans use coins, so they work from any country.",
          )}
        </p>
      </AlertDescription>
    </Alert>
  )
}

function StepItem(props: {
  n: number
  state: "done" | "current" | "todo"
  title: string
  children?: React.ReactNode
}) {
  return (
    <li className="flex gap-3">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-sm",
          props.state === "done" && "bg-emerald-600 text-white",
          props.state === "current" &&
            "bg-primary text-primary-foreground ring-4 ring-primary/20",
          props.state === "todo" && "bg-muted text-muted-foreground",
        )}
      >
        {props.state === "done" ? <CheckIcon className="size-4" /> : props.n}
      </span>
      <div className="min-w-0 flex-1 space-y-2 pt-1">
        <p
          className={cn(
            "font-semibold",
            props.state === "todo" && "text-muted-foreground",
          )}
        >
          {props.title}
        </p>
        {props.state !== "todo" && props.children}
      </div>
    </li>
  )
}

function NeedItem(props: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  const Icon = props.icon
  return (
    <li className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span>{props.children}</span>
    </li>
  )
}

function FaqItem(props: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="font-semibold">{props.q}</dt>
      <dd className="text-muted-foreground">{props.children}</dd>
    </div>
  )
}

function BalanceTile(props: {
  label: string
  value: number
  hint?: string
  accent?: boolean
}) {
  const t = useTranslation()
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        props.accent && "border-emerald-500/40 bg-emerald-500/5",
      )}
    >
      <div className="text-muted-foreground text-xs">{props.label}</div>
      <div className="font-bold text-lg tabular-nums">
        {formatYen(props.value, t.isEnglish)}
      </div>
      {props.hint && (
        <div className="text-[11px] text-muted-foreground">{props.hint}</div>
      )}
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
        <CardTitle className="text-base">
          {t("振込の記録", "Payouts")}
        </CardTitle>
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
              <span className="text-right">
                {formatYen(p.grossYen, t.isEnglish)}
              </span>
              <span>{t("所得税（源泉徴収）", "Withholding tax")}</span>
              <span className="text-right">
                -{formatYen(p.withholdingYen, t.isEnglish)}
              </span>
              <span>{t("振込手数料", "Fee")}</span>
              <span className="text-right">
                -{formatYen(p.feeYen, t.isEnglish)}
              </span>
              <span className="font-bold text-foreground">
                {t("振込額", "Net")}
              </span>
              <span className="text-right font-bold text-foreground">
                {formatYen(p.netYen, t.isEnglish)}
              </span>
            </div>
            {p.sentAt && (
              <div className="text-muted-foreground text-xs">
                {t("送金日", "Sent")}: {formatDate(p.sentAt, t.isEnglish)}
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
    HOLDING: t("確認期間中", "Checking"),
    HELD: t("次の振込に入る", "Next payout"),
    IN_PAYOUT: t("振込の準備中", "Processing"),
    PAID: t("振込済み", "Paid"),
    REVERSED: t("取り消し", "Reversed"),
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {t("もらった推しの明細", "Rewards history")}
        </CardTitle>
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
                    {formatDate(e.createdAt, t.isEnglish)}
                    {e.status === "HOLDING" &&
                      t(
                        ` ・ ${formatDate(e.availableAt, t.isEnglish)} に確認期間が終わります`,
                        ` · available from ${formatDate(e.availableAt, t.isEnglish)}`,
                      )}
                    {e.expectedCloseAt &&
                      t(
                        ` ・ 振込予定 ${formatDate(e.expectedCloseAt, t.isEnglish)}（最短）`,
                        ` · payout ${formatDate(e.expectedCloseAt, t.isEnglish)} (earliest)`,
                      )}
                  </div>
                </div>
                <Badge variant="outline">{label[e.status]}</Badge>
                <span className="w-20 text-right font-medium">
                  {formatYen(e.amountYen, t.isEnglish)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
