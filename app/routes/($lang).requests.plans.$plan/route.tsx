import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Images,
  Pencil,
  RefreshCcw,
  ShieldCheck,
  Users,
} from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import {
  AutoTranslatedInline,
  AutoTranslatedText,
} from "~/components/auto-translated-text"
import {
  RequestShowcaseGrid,
  RequestShowcaseR18Section,
} from "~/components/requests/request-showcase"
import {
  CoinPrice,
  RequestUserChip,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  planCategoryLabel,
  planImageUrls,
  type RequestPlan,
  type RequestShowcaseItem,
  requestErrorMessage,
  requestsPost,
} from "~/lib/requests-api"
import { fetchRequestsInternal } from "~/lib/server/requests-api.server"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"

export async function loader({ params, context }: LoaderFunctionArgs) {
  const id = String(params.plan ?? "")
  if (!/^\d+$/.test(id)) throw new Response("Not Found", { status: 404 })
  const data = await fetchRequestsInternal<{
    plan: RequestPlan
    users: RequestUsers
    showcase?: RequestShowcaseItem[]
    showcaseCount?: number
    showcaseR18Count?: number
  }>(context, `/plans/${id}`)
  if (!data?.plan) throw new Response("Not Found", { status: 404 })
  return data
}

export const meta: MetaFunction<typeof loader> = (props) =>
  createMeta(
    META.REQUEST_PLAN,
    {
      title: props.data?.plan.title ?? "",
      description: (props.data?.plan.description ?? "").slice(0, 120),
      image:
        (props.data?.plan ? planImageUrls(props.data.plan)[0] : undefined) ??
        config.defaultOgpImageUrl,
    },
    props.params.lang,
  )

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

export default function RequestPlanPage() {
  const {
    plan,
    users,
    showcase = [],
    showcaseCount = 0,
    showcaseR18Count = 0,
  } = useLoaderData<typeof loader>()
  const auth = useContext(AuthContext)
  const t = useTranslation()
  const creator = users[plan.userId]
  const [imageIndex, setImageIndex] = useState(0)
  const images = planImageUrls(plan)
  const isOwner = auth.userId === plan.userId
  const full =
    plan.activeCount !== undefined && plan.activeCount >= plan.maxActive
  const canRequest = plan.isAccepting && !full && !isOwner

  const report = async () => {
    const reason = window.prompt(
      t("通報の理由を書いてください", "Please enter the reason for reporting"),
    )
    if (!reason) return
    try {
      await requestsPost({ op: "report-plan", id: plan.id, reason })
      toast.success(
        t(
          "通報しました。運営が確認します",
          "Reported. Our staff will review it",
        ),
      )
    } catch (error) {
      toast.error(requestErrorMessage(error, t.isEnglish))
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 pt-4 pb-40 md:px-6 md:pb-12">
      <Link
        to="/requests"
        className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t("プランを探す", "Find plans")}
      </Link>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
            {images[imageIndex] ? (
              <img
                src={images[imageIndex]}
                alt=""
                className="size-full object-contain"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <Images className="size-10 text-muted-foreground opacity-40" />
              </div>
            )}
          </div>
          {plan.sampleImageUrls.length === 0 && images.length > 0 && (
            <p className="text-muted-foreground text-xs">
              {t(
                "見本の画像がないため、クリエイターの投稿作品を表示しています",
                "No samples yet, so the creator's posted works are shown",
              )}
            </p>
          )}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  className={cn(
                    "size-16 shrink-0 overflow-hidden rounded-xl border-2",
                    i === imageIndex
                      ? "border-foreground"
                      : "border-transparent opacity-70",
                  )}
                >
                  <img src={url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-muted px-3 py-1 font-bold text-xs">
              {planCategoryLabel(plan.category, t.isEnglish)}
            </span>
            {plan.allowsR18 && (
              <span className="rounded-full bg-rose-500 px-2.5 py-1 font-bold text-white text-xs">
                {t("R18可", "R18 OK")}
              </span>
            )}
            {plan.premiumOnly && (
              <span className="rounded-full bg-fuchsia-600 px-2.5 py-1 font-bold text-white text-xs">
                {t("プレミアムコインのみ", "Premium coins only")}
              </span>
            )}
            {plan.status === "HIDDEN" && (
              <span className="rounded-full bg-foreground px-2.5 py-1 font-bold text-background text-xs">
                {t("非公開", "Hidden")}
              </span>
            )}
          </div>
          <h1 className="font-bold text-xl leading-snug md:text-2xl">
            <AutoTranslatedInline text={plan.title} />
          </h1>
          <RequestUserChip user={creator} size="md" />
          <CoinPrice coins={plan.priceCoins} className="text-3xl" />

          <dl className="grid grid-cols-2 gap-2 text-sm">
            <Spec
              icon={<CalendarClock className="size-4" />}
              label={t("納期", "Delivery")}
              value={t(
                `承諾から ${plan.deliveryDays} 日`,
                `${plan.deliveryDays} ${plan.deliveryDays === 1 ? "day" : "days"} after acceptance`,
              )}
            />
            <Spec
              icon={<Images className="size-4" />}
              label={t("枚数", "Images")}
              value={t(
                `${plan.imageCount} 枚`,
                `${plan.imageCount} ${plan.imageCount === 1 ? "image" : "images"}`,
              )}
            />
            <Spec
              icon={<RefreshCcw className="size-4" />}
              label={t("修正", "Revisions")}
              value={t(
                `${plan.revisionCount} 回まで`,
                `Up to ${plan.revisionCount}`,
              )}
            />
            <Spec
              icon={<Users className="size-4" />}
              label={t("受付", "Slots")}
              value={
                plan.isAccepting
                  ? t(
                      `${plan.activeCount ?? 0} / ${plan.maxActive} 件`,
                      `${plan.activeCount ?? 0} / ${plan.maxActive}`,
                    )
                  : t("停止中", "Paused")
              }
            />
          </dl>

          <div className="hidden md:block">
            <RequestActions
              planId={plan.id}
              canRequest={canRequest}
              isOwner={isOwner}
              full={full}
              isAccepting={plan.isAccepting}
            />
          </div>

          <section className="rounded-2xl bg-muted/50 p-4">
            <h2 className="mb-2 font-bold text-sm">
              {t("プランの内容", "Plan details")}
            </h2>
            <AutoTranslatedText
              text={plan.description}
              className="whitespace-pre-wrap break-words text-sm leading-relaxed"
              toggleClassName="mt-2"
            />
          </section>

          {(showcase.length > 0 || showcaseR18Count > 0) && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-bold text-sm">
                  {t(
                    `このプランの実績（${showcaseCount + showcaseR18Count}）`,
                    `Works from this plan (${showcaseCount + showcaseR18Count})`,
                  )}
                </h2>
                {showcaseCount > showcase.length && (
                  <Link
                    to={`/requests/showcase?planId=${plan.id}`}
                    className="flex items-center text-muted-foreground text-sm hover:text-foreground"
                  >
                    {t("すべて見る", "See all")}
                    <ChevronRight className="size-4" />
                  </Link>
                )}
              </div>
              {showcase.length > 0 && (
                <RequestShowcaseGrid items={showcase} users={users} />
              )}
              <RequestShowcaseR18Section
                count={showcaseR18Count}
                planId={plan.id}
                users={users}
              />
            </section>
          )}

          <section className="flex flex-col gap-1.5 rounded-2xl border p-4 text-muted-foreground text-xs">
            <p className="flex items-center gap-1.5 font-bold text-foreground text-sm">
              <ShieldCheck className="size-4" />
              {t("安心のしくみ", "How you're protected")}
            </p>
            <p>
              {t(
                "・コインは申し込みのときに預かり、取引が完了するまでクリエイターには渡りません。",
                "• Your coins are held when you apply and are not passed to the creator until the request is completed.",
              )}
            </p>
            <p>
              {t(
                "・お断り・3 日以内に返事がない・納期を過ぎたときは、コインが全額戻ります。",
                "• If the request is declined, gets no reply within 3 days, or passes the due date, all your coins are returned.",
              )}
            </p>
            <p>
              {t(
                "・納品から 7 日たつと自動で受け取り完了になります。",
                "• Receipt is confirmed automatically 7 days after delivery.",
              )}
            </p>
            <Link to="/requests/terms" className="w-fit underline">
              {t("有料リクエスト規約", "Paid Request Terms")}
            </Link>
          </section>

          {!isOwner && auth.isLoggedIn && (
            <button
              type="button"
              onClick={report}
              className="flex w-fit items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
            >
              <Flag className="size-3.5" />
              {t("このプランを通報", "Report this plan")}
            </button>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[var(--aip-tabbar-h,0px)] z-30 border-t bg-background/95 px-3 py-2.5 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <CoinPrice coins={plan.priceCoins} className="text-xl" />
          <div className="flex-1">
            <RequestActions
              planId={plan.id}
              canRequest={canRequest}
              isOwner={isOwner}
              full={full}
              isAccepting={plan.isAccepting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Spec(props: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
      <span className="text-muted-foreground">{props.icon}</span>
      <div className="min-w-0">
        <dt className="text-[11px] text-muted-foreground">{props.label}</dt>
        <dd className="truncate font-bold">{props.value}</dd>
      </div>
    </div>
  )
}

function RequestActions(props: {
  planId: string
  canRequest: boolean
  isOwner: boolean
  full: boolean
  isAccepting: boolean
}) {
  const t = useTranslation()
  if (props.isOwner) {
    return (
      <Button
        asChild
        variant="secondary"
        className="h-12 w-full rounded-full font-bold"
      >
        <Link to={`/requests/my-plans?edit=${props.planId}`}>
          <Pencil className="mr-1 size-4" />
          {t("プランを編集する", "Edit plan")}
        </Link>
      </Button>
    )
  }
  if (!props.canRequest) {
    return (
      <Button disabled className="h-12 w-full rounded-full font-bold">
        {props.full
          ? t("受付上限に達しています", "No slots available")
          : t("受付停止中", "Not accepting requests")}
      </Button>
    )
  }
  return (
    <Button asChild className="h-12 w-full rounded-full font-bold text-base">
      <Link to={`/requests/new?plan=${props.planId}`}>
        {t("このプランで依頼する", "Request with this plan")}
      </Link>
    </Button>
  )
}
