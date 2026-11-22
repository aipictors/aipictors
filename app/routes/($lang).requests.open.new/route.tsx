import type { MetaFunction } from "@remix-run/cloudflare"
import { useLocation, useSearchParams } from "@remix-run/react"
import { ChevronLeft, Loader2, ShieldCheck } from "lucide-react"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { appFilterChipClassName } from "~/components/app/app-pill-tab"
import { RequestImagePicker } from "~/components/requests/request-image-picker"
import { CoinPrice } from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { AuthContext } from "~/contexts/auth-context"
import { useContentMode } from "~/hooks/use-content-mode"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useNavigate } from "~/lib/app/locale-router"
import {
  type OpenRequestConfig,
  openRequestErrorMessage,
  openRequestsGet,
  openRequestsPost,
} from "~/lib/open-requests-api"
import { formatCoins } from "~/lib/requests-api"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { LazyPurchasePremiumCoinsDialog as PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/lazy-purchase-premium-coins-dialog"

export const meta: MetaFunction = () => [
  { title: "募集する | 募集リクエスト | Aipictors" },
  { name: "robots", content: "noindex" },
]

const REWARDS = [300, 500, 1000, 3000]
const DAYS = [3, 7, 14]
/** コインを買いに行って戻ってきたときに入力を戻す */
const DRAFT_KEY = "open-request-draft"

type Draft = {
  clientKey: string
  title: string
  body: string
  referenceImageUrls: string[]
  rewardCoins: number
  deadlineDays: number
  isR18: boolean
  showcaseAllowed: boolean
  agreed: boolean
}

const newDraft = (): Draft => ({
  clientKey: crypto.randomUUID(),
  title: "",
  body: "",
  referenceImageUrls: [],
  rewardCoins: 500,
  deadlineDays: 7,
  isR18: false,
  showcaseAllowed: true,
  agreed: false,
})

const loadDraft = (): Draft => {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY)
    if (saved) return { ...newDraft(), ...(JSON.parse(saved) as Draft) }
  } catch {}
  return newDraft()
}

/** 募集リクエストを出す */
export default function NewOpenRequestPage() {
  const t = useTranslation()
  const auth = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const contentMode = useContentMode()
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState<Draft>(newDraft)
  const [config, setConfig] = useState<OpenRequestConfig | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  useEffect(() => {
    setDraft(loadDraft())
  }, [])
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {}
  }, [draft])

  const reloadConfig = useCallback(async () => {
    const data = await openRequestsGet<OpenRequestConfig>({ op: "config" })
    setConfig(data)
  }, [])

  useEffect(() => {
    if (!auth.isLoggedIn) return
    void reloadConfig().catch(() => {})
  }, [auth.isLoggedIn, reloadConfig])

  // コインを買って戻ってきたとき: 購入を確かめて残高を取り直す
  const checkout = searchParams.get("checkout")
  const sessionId = searchParams.get("session_id")
  useEffect(() => {
    if (!checkout || !auth.isLoggedIn) return
    const clear = () => {
      const next = new URLSearchParams(searchParams)
      next.delete("checkout")
      next.delete("session_id")
      setSearchParams(next, { replace: true, preventScrollReset: true })
    }
    if (checkout === "premium-cancel") {
      toast.message(
        t(
          "コインの購入をキャンセルしました。入力はそのまま残っています",
          "Coin purchase canceled. Your input has been kept",
        ),
      )
      clear()
      return
    }
    if (checkout === "premium-success" && sessionId) {
      void (async () => {
        try {
          const headers = await getViewerRequestHeaders({
            includeJsonContentType: true,
          })
          await fetch("/api/stripe/premium-coins-confirm", {
            method: "POST",
            headers,
            body: JSON.stringify({ sessionId }),
          })
        } catch {}
        await reloadConfig().catch(() => {})
        toast.success(
          t(
            "コインを購入しました。続けて募集できます",
            "Coins purchased. You can continue posting",
          ),
        )
        clear()
      })()
    }
  }, [checkout, sessionId, auth.isLoggedIn])

  const purchasePath = useMemo(() => {
    const next = new URLSearchParams(searchParams)
    next.delete("checkout")
    next.delete("session_id")
    return `${location.pathname}?${next.toString()}`
  }, [location.pathname, searchParams])

  const balance = config?.account?.paidPremiumBalance ?? null
  const shortage =
    balance === null ? 0 : Math.max(0, draft.rewardCoins - balance)
  const minCoins = config?.minCoins ?? 100
  const maxCoins = config?.maxCoins ?? 100000
  const feeRate = (config?.feePpm ?? 100000) / 1000000
  const rewardOk =
    draft.rewardCoins >= minCoins && draft.rewardCoins <= maxCoins
  const canSubmit =
    !submitting &&
    auth.isLoggedIn &&
    draft.title.trim().length > 0 &&
    draft.body.trim().length > 0 &&
    rewardOk &&
    draft.agreed &&
    balance !== null &&
    shortage === 0

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const data = await openRequestsPost<{ requestId: string }>({
        op: "create",
        clientKey: draft.clientKey,
        title: draft.title,
        body: draft.body,
        referenceImageUrls: draft.referenceImageUrls,
        rewardCoins: draft.rewardCoins,
        deadlineDays: draft.deadlineDays,
        isR18: draft.isR18,
        showcaseAllowed: draft.showcaseAllowed,
      })
      sessionStorage.removeItem(DRAFT_KEY)
      toast.success(t("募集を出しました", "Your request has been posted"))
      navigate(`/requests/open/${data.requestId}`)
    } catch (error) {
      toast.error(openRequestErrorMessage(error, t.isEnglish))
    } finally {
      setSubmitting(false)
    }
  }

  if (auth.isNotLoggedIn) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="font-bold">
          {t(
            "募集するにはログインしてください",
            "Please log in to post a request",
          )}
        </p>
        <Button asChild className="rounded-full font-bold">
          <Link to="/login">{t("ログイン", "Log in")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-3 pt-4 pb-32 md:px-6">
      <Link
        to="/requests/open"
        className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t("募集の一覧に戻る", "Back to open requests")}
      </Link>
      <h1 className="font-bold text-xl">{t("募集する", "Post a request")}</h1>

      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-bold text-sm">{t("タイトル", "Title")}</span>
          <Input
            value={draft.title}
            maxLength={60}
            placeholder={t(
              "例）白い猫のアイコン",
              "e.g. An icon of a white cat",
            )}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-bold text-sm">
            {t("描いてほしいもの", "What you want")}
          </span>
          <Textarea
            value={draft.body}
            maxLength={3000}
            rows={7}
            placeholder={t(
              "例）\n・白い猫、青い目\n・ふわふわした感じ\n・背景はシンプルに\n・X のアイコンに使います",
              "e.g.\n• A white cat with blue eyes\n• Fluffy\n• Simple background\n• For my X icon",
            )}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-sm">
            {t("参考画像（任意）", "Reference images (optional)")}
          </span>
          <RequestImagePicker
            value={draft.referenceImageUrls}
            onChange={(urls) =>
              setDraft((d) => ({ ...d, referenceImageUrls: urls }))
            }
            max={4}
            maxSide={1600}
            label={t("参考", "Ref")}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-sm">
            {t("報酬（プレミアムコイン）", "Reward (premium coins)")}
          </span>
          <div className="flex flex-wrap gap-2">
            {REWARDS.map((n) => (
              <button
                key={n}
                type="button"
                className={appFilterChipClassName(draft.rewardCoins === n)}
                onClick={() => setDraft((d) => ({ ...d, rewardCoins: n }))}
              >
                {formatCoins(n, t.isEnglish)}
              </button>
            ))}
          </div>
          <Input
            type="number"
            inputMode="numeric"
            min={minCoins}
            max={maxCoins}
            value={draft.rewardCoins}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                rewardCoins: Math.floor(Number(e.target.value) || 0),
              }))
            }
          />
          <p className="text-muted-foreground text-xs">
            {t(
              `${formatCoins(minCoins)}〜${formatCoins(maxCoins)} コイン。採用された人には手数料 ${Math.round(feeRate * 100)}% を引いた ${formatCoins(Math.floor(draft.rewardCoins * (1 - feeRate)))} コイン分が届きます。`,
              `${formatCoins(minCoins, true)}–${formatCoins(maxCoins, true)} coins. The picked creator receives ${formatCoins(Math.floor(draft.rewardCoins * (1 - feeRate)), true)} coins after the ${Math.round(feeRate * 100)}% fee.`,
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-sm">{t("締切", "Deadline")}</span>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((n) => (
              <button
                key={n}
                type="button"
                className={appFilterChipClassName(draft.deadlineDays === n)}
                onClick={() => setDraft((d) => ({ ...d, deadlineDays: n }))}
              >
                {t(`${n}日後`, `${n} days`)}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            {t(
              "締切までに採用しないと、いいねが一番多い提案が自動で採用されます。提案がなければ報酬は全額戻ります。",
              "If you don't pick an entry by the deadline, the most-liked entry is picked automatically. With no entries, the full reward is returned.",
            )}
          </p>
        </div>
        <label className="flex items-start justify-between gap-3">
          <span className="flex flex-col">
            <span className="font-bold text-sm">
              {t(
                "採用した作品を実績として公開してOK",
                "Allow showing the picked work as an achievement",
              )}
            </span>
            <span className="text-muted-foreground text-xs">
              {t(
                "採用された人のページの実績に載ります。あとから変えられます",
                "It appears in the creator's achievements. You can change this later",
              )}
            </span>
          </span>
          <Switch
            checked={draft.showcaseAllowed}
            onCheckedChange={(v) =>
              setDraft((d) => ({ ...d, showcaseAllowed: v }))
            }
          />
        </label>
        {contentMode === "r18" && (
          <label className="flex items-start justify-between gap-3">
            <span className="flex flex-col">
              <span className="font-bold text-sm">
                {t("R18 の募集", "R18 request")}
              </span>
              <span className="text-muted-foreground text-xs">
                {t(
                  "R18 の募集は年齢を確認した人にだけ表示されます。報酬は現金の対象外です",
                  "R18 requests are only shown to age-verified users and are not eligible for cash rewards",
                )}
              </span>
            </span>
            <Switch
              checked={draft.isR18}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, isR18: v }))}
            />
          </label>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("報酬に使えるプレミアムコイン", "Premium coins you can use")}
          </span>
          {balance === null ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <CoinPrice coins={balance} />
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          {t(
            "報酬に使えるのは購入したプレミアムコインだけです（無料でもらったコインは使えません）。",
            "Only purchased premium coins can be used for rewards (coins you received for free cannot be used).",
          )}
        </p>
        {shortage > 0 && (
          <Button
            type="button"
            className="h-11 rounded-full font-bold"
            onClick={() => setPurchaseOpen(true)}
          >
            {t(
              `あと ${formatCoins(shortage)} コイン必要です（購入する）`,
              `You need ${formatCoins(shortage, true)} more coins (buy)`,
            )}
          </Button>
        )}
        <p className="flex items-start gap-1.5 text-muted-foreground text-xs">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          {t(
            "報酬は採用まで預かりになります。提案が届く前なら取り下げられ、全額戻ります。届いた提案はみんなが見られます。",
            "The reward is held until you pick an entry. You can cancel for a full refund before entries arrive. Entries are visible to everyone.",
          )}
        </p>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={draft.agreed}
            onCheckedChange={(v) =>
              setDraft((d) => ({ ...d, agreed: v === true }))
            }
            className="mt-0.5"
          />
          <span>
            {t("", "I agree to the ")}
            <Link to="/requests/terms" target="_blank" className="underline">
              {t("有料リクエスト規約", "Paid Request Terms")}
            </Link>
            {t("に同意します", "")}
          </span>
        </label>
      </section>

      <div className="fixed inset-x-0 bottom-[var(--aip-tabbar-h,0px)] z-30 border-t bg-background/95 px-3 py-2.5 backdrop-blur-md md:bottom-0">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">
              {t("報酬", "Reward")}
            </span>
            <CoinPrice coins={draft.rewardCoins} className="text-lg" />
          </div>
          <Button
            className="h-12 flex-1 rounded-full font-bold text-base"
            disabled={!canSubmit}
            onClick={submit}
          >
            {submitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              t("この内容で募集する", "Post this request")
            )}
          </Button>
        </div>
      </div>

      <PurchasePremiumCoinsDialog
        currentBalance={balance ?? 0}
        open={purchaseOpen}
        onOpenChange={(open) => {
          setPurchaseOpen(open)
          if (!open) void reloadConfig().catch(() => {})
        }}
        hideTrigger
        initialCoinAmount={shortage > 0 ? shortage : undefined}
        successPath={purchasePath}
        cancelPath={purchasePath}
      />
    </div>
  )
}
