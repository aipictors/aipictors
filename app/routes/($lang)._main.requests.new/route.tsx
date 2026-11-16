import type { MetaFunction } from "@remix-run/cloudflare"
import { useLocation, useSearchParams } from "@remix-run/react"
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import { RequestImagePicker } from "~/components/requests/request-image-picker"
import {
  CoinPrice,
  RequestUserChip,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useNavigate } from "~/lib/app/locale-router"
import {
  type CreatorRequestProfile,
  formatCoins,
  type RequestPlan,
  RequestsApiError,
  requestErrorMessage,
  requestsGet,
  requestsPost,
} from "~/lib/requests-api"
import { cn } from "~/lib/utils"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { LazyPurchasePremiumCoinsDialog as PurchasePremiumCoinsDialog } from "~/routes/($lang).settings.points/components/lazy-purchase-premium-coins-dialog"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) =>
  createMeta(META.REQUEST_NEW, undefined, props.params.lang)

type Draft = {
  title: string
  body: string
  referenceImageUrls: string[]
  isR18: boolean
  priceCoins: number
  deliveryDays: number
  agreed: boolean
  clientKey: string
}

const newKey = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

/** 下書きはブラウザに保存する（コインを買いに行って戻ってきても消えない） */
const draftKey = (target: string) => `aipictors.requestDraft.${target}`
const loadDraft = (target: string): Partial<Draft> | null => {
  try {
    return JSON.parse(window.localStorage.getItem(draftKey(target)) ?? "null")
  } catch {
    return null
  }
}

export default function NewRequestPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  const t = useTranslation()
  const planId = searchParams.get("plan")
  const creatorParam = searchParams.get("creator")
  const target = planId ? `plan-${planId}` : `creator-${creatorParam ?? ""}`

  const [plan, setPlan] = useState<RequestPlan | null>(null)
  const [profile, setProfile] = useState<CreatorRequestProfile | null>(null)
  const [users, setUsers] = useState<RequestUsers>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const [balance, setBalance] = useState<{
    free: number
    premium: number
  } | null>(null)
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [draft, setDraft] = useState<Draft>({
    title: "",
    body: "",
    referenceImageUrls: [],
    isR18: false,
    priceCoins: 0,
    deliveryDays: 14,
    agreed: false,
    clientKey: newKey(),
  })
  const restored = useRef(false)

  // 対象（プラン・クリエイター）を読む
  useEffect(() => {
    let canceled = false
    const load = async () => {
      try {
        if (planId) {
          const data = await requestsGet<{
            plan: RequestPlan
            users: RequestUsers
          }>({ op: "plan", id: planId })
          if (canceled) return
          setPlan(data.plan)
          setUsers(data.users)
          setDraft((d) => ({ ...d, priceCoins: data.plan.priceCoins }))
        } else if (creatorParam) {
          const data = await requestsGet<
            CreatorRequestProfile & { users: RequestUsers }
          >({ op: "creator", userId: creatorParam })
          if (canceled) return
          setProfile(data)
          setUsers(data.users)
          setDraft((d) => ({
            ...d,
            priceCoins: d.priceCoins || Math.max(data.settings.minCoins, 500),
          }))
        } else {
          setLoadError(
            t(
              "リクエスト先が指定されていません",
              "No request recipient was specified",
            ),
          )
        }
      } catch (error) {
        if (!canceled) setLoadError(requestErrorMessage(error, t.isEnglish))
      }
    }
    void load()
    return () => {
      canceled = true
    }
  }, [planId, creatorParam, t.isEnglish])

  // 下書きを戻す（1 回だけ）
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    const saved = loadDraft(target)
    if (saved)
      setDraft((d) => ({
        ...d,
        ...saved,
        clientKey: saved.clientKey ?? d.clientKey,
      }))
  }, [target])

  // 下書きを保存する
  useEffect(() => {
    if (!restored.current) return
    window.localStorage.setItem(draftKey(target), JSON.stringify(draft))
  }, [draft, target])

  const reloadBalance = useCallback(async () => {
    try {
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })
      const res = await fetch("/api/coins/summary", { headers })
      const json = (await res.json()) as {
        data?: { freeBalance?: number; premiumBalance?: number }
      }
      if (json.data)
        setBalance({
          free: json.data.freeBalance ?? 0,
          premium: json.data.premiumBalance ?? 0,
        })
    } catch {}
  }, [])

  useEffect(() => {
    if (auth.isLoggedIn) void reloadBalance()
  }, [auth.isLoggedIn, reloadBalance])

  // コインを買って戻ってきたとき: 購入を確かめて残高を取り直す（入力は下書きから戻っている）
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
        await reloadBalance()
        toast.success(
          t(
            "コインを購入しました。続けて依頼できます",
            "Coins purchased. You can continue with your request",
          ),
        )
        clear()
      })()
    }
  }, [checkout, sessionId, auth.isLoggedIn])

  const creatorId = plan?.userId ?? creatorParam ?? ""
  const creator = users[creatorId]
  const settings = profile?.settings
  const price = plan ? plan.priceCoins : draft.priceCoins
  const minCoins = settings?.minCoins ?? 100
  const allowsR18 = plan ? plan.allowsR18 : (settings?.allowsR18 ?? false)
  const total = balance ? balance.free + balance.premium : 0
  const shortage = balance ? Math.max(0, price - total) : 0
  const isOwn = auth.userId !== null && auth.userId === creatorId
  const closed = plan
    ? !plan.isAccepting || (plan.activeCount ?? 0) >= plan.maxActive
    : profile !== null && !profile.canFreeRequest

  const canSubmit =
    !submitting &&
    !isOwn &&
    !closed &&
    draft.body.trim().length > 0 &&
    draft.agreed &&
    balance !== null &&
    shortage === 0 &&
    price >= (plan ? 1 : minCoins)

  const purchasePath = useMemo(() => {
    const next = new URLSearchParams(searchParams)
    next.delete("checkout")
    next.delete("session_id")
    return `${location.pathname}?${next.toString()}`
  }, [location.pathname, searchParams])

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const data = await requestsPost<{ requestId: string }>({
        op: "apply",
        planId: plan?.id ?? null,
        creatorUserId: creatorId,
        clientKey: draft.clientKey,
        title: draft.title,
        body: draft.body,
        referenceImageUrls: draft.referenceImageUrls,
        isR18: allowsR18 && draft.isR18,
        priceCoins: price,
        deliveryDays: draft.deliveryDays,
      })
      window.localStorage.removeItem(draftKey(target))
      navigate(`/requests/${data.requestId}?created=1`)
    } catch (error) {
      if (
        error instanceof RequestsApiError &&
        error.code === "INSUFFICIENT_COINS"
      ) {
        await reloadBalance()
        setPurchaseOpen(true)
      }
      toast.error(requestErrorMessage(error, t.isEnglish))
    } finally {
      setSubmitting(false)
    }
  }

  if (auth.isNotLoggedIn) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="font-bold">
          {t(
            "リクエストするにはログインしてください",
            "Please log in to send a request",
          )}
        </p>
        <Button asChild className="rounded-full">
          <Link to="/login">{t("ログイン", "Log in")}</Link>
        </Button>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center text-muted-foreground">
        {loadError}
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 pt-3 pb-44 md:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t("戻る", "Back")}
      </button>
      <h1 className="font-bold text-xl">
        {t("リクエストする", "New request")}
      </h1>

      {/* 依頼先 */}
      <section className="flex items-center gap-3 rounded-2xl border p-3">
        {plan?.sampleImageUrls[0] ? (
          <img
            src={plan.sampleImageUrls[0]}
            alt=""
            className="size-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="size-16 shrink-0 rounded-xl bg-muted" />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate font-bold text-sm">
            {plan
              ? plan.title
              : t(
                  "自由リクエスト（金額と内容を自分で決める）",
                  "Open request (you set the price and details)",
                )}
          </p>
          <RequestUserChip user={creator} link={false} />
          {plan && (
            <p className="text-muted-foreground text-xs">
              {t(
                `納期 ${plan.deliveryDays} 日・${plan.imageCount} 枚・修正 ${plan.revisionCount} 回`,
                `${plan.deliveryDays}-day delivery · ${plan.imageCount} ${plan.imageCount === 1 ? "image" : "images"} · ${plan.revisionCount} ${plan.revisionCount === 1 ? "revision" : "revisions"}`,
              )}
            </p>
          )}
        </div>
        {plan && <CoinPrice coins={plan.priceCoins} className="text-lg" />}
      </section>
      {settings?.note && !plan && (
        <p className="whitespace-pre-wrap rounded-2xl bg-muted/50 p-3 text-sm">
          {settings.note}
        </p>
      )}
      {isOwn && (
        <p className="rounded-xl bg-amber-100 p-3 text-amber-900 text-sm dark:bg-amber-500/15 dark:text-amber-200">
          {t(
            "自分にはリクエストできません",
            "You cannot send a request to yourself",
          )}
        </p>
      )}
      {closed && !isOwn && (
        <p className="rounded-xl bg-muted p-3 text-sm">
          {t(
            "いまはリクエストを受け付けていません",
            "Not accepting requests right now",
          )}
        </p>
      )}

      {/* 自由リクエストの金額と納期 */}
      {!plan && profile && (
        <section className="flex flex-col gap-3 rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm">{t("金額", "Price")}</p>
              <p className="text-muted-foreground text-xs">
                {t(
                  `${formatCoins(minCoins)} コインから`,
                  `From ${formatCoins(minCoins, true)} coins`,
                )}
              </p>
            </div>
            <Input
              type="number"
              inputMode="numeric"
              min={minCoins}
              max={100000}
              step={100}
              value={draft.priceCoins || ""}
              className="h-11 w-36 text-right font-bold text-base"
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  priceCoins: Math.min(
                    100000,
                    Math.max(0, Math.floor(Number(e.target.value) || 0)),
                  ),
                }))
              }
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[500, 1000, 3000, 5000, 10000]
              .filter((n) => n >= minCoins)
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, priceCoins: n }))}
                  className={cn(
                    "h-9 rounded-full border px-3 font-bold text-xs",
                    draft.priceCoins === n &&
                      "border-foreground bg-foreground text-background",
                  )}
                >
                  {formatCoins(n, t.isEnglish)}
                </button>
              ))}
          </div>
          {draft.priceCoins > 0 && draft.priceCoins < minCoins && (
            <p className="text-destructive text-xs">
              {t(
                `${formatCoins(minCoins)} コイン以上にしてください`,
                `Please enter at least ${formatCoins(minCoins, true)} coins`,
              )}
            </p>
          )}
          <div>
            <p className="mb-2 font-bold text-sm">
              {t(
                "希望の納期（承諾から）",
                "Preferred delivery (after acceptance)",
              )}
            </p>
            <div className="flex gap-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({ ...d, deliveryDays: days }))
                  }
                  className={cn(
                    "h-10 flex-1 rounded-full border font-bold text-sm",
                    draft.deliveryDays === days
                      ? "border-foreground bg-foreground text-background"
                      : "",
                  )}
                >
                  {t(`${days} 日`, `${days} days`)}
                </button>
              ))}
            </div>
          </div>
          <Input
            value={draft.title}
            maxLength={60}
            placeholder={t(
              "タイトル（例: 推しキャラのアイコン）",
              "Title (e.g. An icon of my favorite character)",
            )}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </section>
      )}

      {/* 内容 */}
      <section className="flex flex-col gap-3 rounded-2xl border p-4">
        <div>
          <p className="font-bold text-sm">
            {t("リクエストの内容", "Request details")}
          </p>
          <p className="text-muted-foreground text-xs">
            {t(
              "キャラクター・服装・ポーズ・背景・用途（アイコン・壁紙など）を具体的に書くと伝わりやすいです",
              "Describe the character, outfit, pose, background, and use (icon, wallpaper, etc.) in detail so the creator understands",
            )}
          </p>
        </div>
        <Textarea
          value={draft.body}
          maxLength={3000}
          rows={7}
          placeholder={t(
            "例）\n・水色の髪の女の子、制服\n・笑顔でピース\n・背景は夏の空\n・X のアイコンに使います",
            "e.g.\n• A girl with light blue hair in a school uniform\n• Smiling and making a peace sign\n• Summer sky in the background\n• For my X icon",
          )}
          onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
        />
        <div>
          <p className="mb-2 font-bold text-sm">
            {t("参考画像（任意）", "Reference images (optional)")}
          </p>
          <RequestImagePicker
            value={draft.referenceImageUrls}
            onChange={(urls) =>
              setDraft((d) => ({ ...d, referenceImageUrls: urls }))
            }
            max={4}
            maxSide={1600}
            label={t("参考", "Reference")}
          />
        </div>
        {allowsR18 && (
          <label className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
            <span className="text-sm">
              <span className="font-bold">
                {t("R18 の内容", "R18 content")}
              </span>
              <span className="block text-muted-foreground text-xs">
                {t(
                  "R18 のリクエストはクリエイターの報酬（現金）の対象外です",
                  "R18 requests are not eligible for creator rewards (cash)",
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

      {/* 支払い */}
      <section className="flex flex-col gap-3 rounded-2xl border p-4">
        <p className="font-bold text-sm">
          {t("お支払い（コイン）", "Payment (coins)")}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span>{t("必要なコイン", "Coins required")}</span>
          <CoinPrice coins={price} className="text-lg" />
        </div>
        <div className="flex items-center justify-between text-muted-foreground text-sm">
          <span>{t("いまの残高", "Current balance")}</span>
          <span>
            {balance === null ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t(
                `無料 ${formatCoins(balance.free)} ＋ プレミアム ${formatCoins(balance.premium)}`,
                `Free ${formatCoins(balance.free, true)} + Premium ${formatCoins(balance.premium, true)}`,
              )
            )}
          </span>
        </div>
        {balance !== null && shortage === 0 && (
          <p className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800 text-xs dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            {t(
              `足りています。依頼後の残高は ${formatCoins(total - price)} コインです（無料コインから先に使います）`,
              `You have enough. Your balance after the request will be ${formatCoins(total - price, true)} coins (free coins are used first)`,
            )}
          </p>
        )}
        {balance !== null && shortage > 0 && (
          <div className="flex flex-col gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
            <p className="flex items-center gap-1.5 font-bold text-amber-900 text-sm dark:text-amber-200">
              <AlertCircle className="size-4" />
              {t(
                `あと ${formatCoins(shortage)} コイン足りません`,
                `You need ${formatCoins(shortage, true)} more coins`,
              )}
            </p>
            <p className="text-amber-900/80 text-xs dark:text-amber-200/80">
              {t(
                "ここで購入できます。書いた内容は保存されるので、購入から戻ったらそのまま依頼できます。",
                "You can buy them here. Your input is saved, so you can send the request when you come back.",
              )}
            </p>
            <Button
              type="button"
              className="h-11 rounded-full font-bold"
              onClick={() => setPurchaseOpen(true)}
            >
              {t("コインを購入する", "Buy coins")}
            </Button>
          </div>
        )}
        <p className="flex items-start gap-1.5 text-muted-foreground text-xs">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          {t(
            "コインは取引が完了するまで預かりになります。お断り・3 日以内に返事がない・納期を過ぎたときは全額戻ります。",
            "Your coins are held until the request is completed. If it is declined, gets no reply within 3 days, or passes the due date, all your coins are returned.",
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
              {t("お支払い", "Payment")}
            </span>
            <CoinPrice coins={price} className="text-lg" />
          </div>
          {balance !== null && shortage > 0 ? (
            <Button
              className="h-12 flex-1 rounded-full font-bold text-base"
              onClick={() => setPurchaseOpen(true)}
            >
              {t("コインを購入して続ける", "Buy coins and continue")}
            </Button>
          ) : (
            <Button
              className="h-12 flex-1 rounded-full font-bold text-base"
              disabled={!canSubmit}
              onClick={submit}
            >
              {submitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                t("コインで依頼する", "Request with coins")
              )}
            </Button>
          )}
        </div>
      </div>

      <PurchasePremiumCoinsDialog
        currentBalance={balance?.premium ?? 0}
        open={purchaseOpen}
        onOpenChange={(open) => {
          setPurchaseOpen(open)
          if (!open) void reloadBalance()
        }}
        hideTrigger
        successPath={purchasePath}
        cancelPath={purchasePath}
      />
    </div>
  )
}
