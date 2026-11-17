import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useNavigation, useSearchParams } from "@remix-run/react"
import {
  CalendarClock,
  ChevronRight,
  Coins,
  HandCoins,
  Inbox,
  Plus,
  ShieldCheck,
} from "lucide-react"
import {
  appFilterChipClassName,
  appPillRowClassName,
  appPillTabClassName,
} from "~/components/app/app-pill-tab"
import {
  RequestPlanCard,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { useRequestsOutletBadge } from "~/components/requests/requests-hub-nav"
import { Button } from "~/components/ui/button"
import { config, META } from "~/config"
import { useContentMode } from "~/hooks/use-content-mode"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  PLAN_CATEGORY_LABELS,
  planCategoryLabel,
  type RequestPlan,
} from "~/lib/requests-api"
import { fetchRequestsInternal } from "~/lib/server/requests-api.server"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) =>
  createMeta(META.REQUEST_PLANS, undefined, props.params.lang)

const SORTS = [
  { value: "popular", ja: "人気", en: "Popular" },
  { value: "new", ja: "新着", en: "Newest" },
  { value: "price_asc", ja: "安い順", en: "Lowest price" },
  { value: "fast", ja: "納期が早い", en: "Fastest delivery" },
]
const PRICES = [500, 1000, 3000, 10000]
const DAYS = [3, 7, 14]

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const params = new URLSearchParams({ limit: "48" })
  for (const key of ["category", "sort", "maxPrice", "maxDays", "r18"]) {
    const value = url.searchParams.get(key)
    if (value) params.set(key, value)
  }
  const data = await fetchRequestsInternal<{
    plans: RequestPlan[]
    users: RequestUsers
  }>(context, `/plans?${params.toString()}`)
  return { plans: data?.plans ?? [], users: data?.users ?? {} }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

/** リクエストのトップ: プランを探す */
export default function RequestPlansPage() {
  const data = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const contentMode = useContentMode()
  const t = useTranslation()
  const category = searchParams.get("category") ?? ""
  const sort = searchParams.get("sort") ?? "popular"
  const maxPrice = searchParams.get("maxPrice") ?? ""
  const maxDays = searchParams.get("maxDays") ?? ""
  const r18 = searchParams.get("r18") === "1"
  const badge = useRequestsOutletBadge()
  const manageCount = badge ? badge.received + badge.toConfirm : 0

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { preventScrollReset: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 pt-4 pb-24 md:px-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 p-5 text-white md:p-8">
        <div className="relative z-10 flex flex-col gap-3 md:max-w-xl">
          <span className="w-fit rounded-full bg-white/20 px-3 py-1 font-bold text-xs backdrop-blur">
            {t("有料リクエスト", "Paid requests")}
          </span>
          <h1 className="font-bold text-2xl leading-tight md:text-3xl">
            {t("好きなクリエイターに", "Get artwork from")}
            <br />
            {t("コインで描いてもらおう", "your favorite creators with coins")}
          </h1>
          <p className="text-sm text-white/90">
            {t(
              "プランを選んで内容を書くだけ。お断り・期限切れのときはコインが全額戻ります。",
              "Just pick a plan and describe your request. If it is declined or expires, all your coins are returned.",
            )}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              asChild
              variant="secondary"
              className="rounded-full font-bold"
            >
              <Link to="/requests/my-plans?new=1">
                <Plus className="mr-1 size-4" />
                {t("自分のプランを出品する", "List your own plan")}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="rounded-full font-bold text-white hover:bg-white/15 hover:text-white"
            >
              <a href="#how-to">{t("依頼の流れ", "How it works")}</a>
            </Button>
          </div>
        </div>
        <HandCoins className="absolute -right-6 -bottom-8 size-48 text-white/15 md:right-6 md:size-64" />
      </section>

      {manageCount > 0 && (
        <Link
          to="/requests/manage"
          className="flex items-center gap-3 rounded-2xl border border-sky-400/70 bg-sky-500/10 p-3 text-sm hover:bg-sky-500/15"
        >
          <Inbox className="size-5 shrink-0 text-sky-500" />
          <span className="flex-1 font-bold">
            {t(
              `対応が必要な依頼が ${manageCount} 件あります`,
              `${manageCount} request${manageCount === 1 ? "" : "s"} need your action`,
            )}
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      )}

      <div className="flex flex-col gap-2">
        <div className={appPillRowClassName}>
          <button
            type="button"
            className={appPillTabClassName(category === "")}
            onClick={() => setParam("category", "")}
          >
            {t("すべて", "All")}
          </button>
          {Object.keys(PLAN_CATEGORY_LABELS).map((value) => (
            <button
              key={value}
              type="button"
              className={appPillTabClassName(category === value)}
              onClick={() => setParam("category", value)}
            >
              {planCategoryLabel(value, t.isEnglish)}
            </button>
          ))}
        </div>
        <div className={appPillRowClassName}>
          {SORTS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={appFilterChipClassName(sort === s.value)}
              onClick={() =>
                setParam("sort", s.value === "popular" ? "" : s.value)
              }
            >
              {t(s.ja, s.en)}
            </button>
          ))}
          <span className="mx-1 w-px shrink-0 bg-border" />
          {PRICES.map((p) => (
            <button
              key={p}
              type="button"
              className={appFilterChipClassName(maxPrice === String(p))}
              onClick={() =>
                setParam("maxPrice", maxPrice === String(p) ? "" : String(p))
              }
            >
              <Coins className="size-3.5" />〜
              {p.toLocaleString(t.isEnglish ? "en-US" : "ja-JP")}
            </button>
          ))}
          <span className="mx-1 w-px shrink-0 bg-border" />
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              className={appFilterChipClassName(maxDays === String(d))}
              onClick={() =>
                setParam("maxDays", maxDays === String(d) ? "" : String(d))
              }
            >
              <CalendarClock className="size-3.5" />
              {t(`〜${d}日`, `≤${d} days`)}
            </button>
          ))}
          {contentMode === "r18" && (
            <button
              type="button"
              className={appFilterChipClassName(r18)}
              onClick={() => setParam("r18", r18 ? "" : "1")}
            >
              {t("R18可のみ", "R18 OK only")}
            </button>
          )}
        </div>
      </div>

      <section
        className={cn(
          "grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-4",
          navigation.state === "loading" && "opacity-60",
        )}
      >
        {data.plans.map((plan) => (
          <RequestPlanCard
            key={plan.id}
            plan={plan}
            user={data.users[plan.userId]}
          />
        ))}
      </section>
      {data.plans.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-14 text-center">
          <HandCoins className="size-10 text-muted-foreground" />
          <p className="font-bold">
            {t(
              "まだ条件に合うプランがありません",
              "No plans match these filters yet",
            )}
          </p>
          <p className="text-muted-foreground text-sm">
            {t(
              "あなたが最初のプランを出品してみませんか？",
              "Why not list the first plan yourself?",
            )}
          </p>
          <Button asChild className="rounded-full font-bold">
            <Link to="/requests/my-plans?new=1">
              {t("プランを出品する", "List a plan")}
            </Link>
          </Button>
        </div>
      )}

      <section
        id="how-to"
        className="grid scroll-mt-20 gap-3 rounded-3xl bg-muted/50 p-5 md:grid-cols-3"
      >
        <HowTo
          step="1"
          title={t("プランを選ぶ", "Choose a plan")}
          body={t(
            "カテゴリ・価格・納期で探して、見本と内容を確認します。",
            "Search by category, price, and delivery time, then check the samples and details.",
          )}
        />
        <HowTo
          step="2"
          title={t(
            "内容を書いてコインで依頼",
            "Describe it and pay with coins",
          )}
          body={t(
            "コインはいったん預かりになります。足りなければその場で購入できます。",
            "Your coins are held until the request ends. If you don't have enough, you can buy more right there.",
          )}
        />
        <HowTo
          step="3"
          title={t("納品を受け取る", "Receive the delivery")}
          body={t(
            "納品を確認して「受け取り完了」で取引が完了します。",
            'Check the delivery and press "Confirm receipt" to complete the request.',
          )}
        />
        <p className="flex items-start gap-2 text-muted-foreground text-xs md:col-span-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          {t(
            "お断り・期限切れ・納期を過ぎたキャンセルのときは、コインが全額戻ります。",
            "If a request is declined, expires, or is canceled after the due date, all your coins are returned.",
          )}
          <Link to="/requests/terms" className="underline">
            {t("有料リクエスト規約", "Paid Request Terms")}
          </Link>
        </p>
      </section>
    </div>
  )
}

function HowTo(props: { step: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground font-bold text-background text-sm">
        {props.step}
      </span>
      <div>
        <p className="font-bold text-sm">{props.title}</p>
        <p className="text-muted-foreground text-xs">{props.body}</p>
      </div>
    </div>
  )
}
