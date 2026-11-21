import { ChevronRight, HandCoins, Plus } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { AutoTranslatedText } from "~/components/auto-translated-text"
import {
  RequestShowcaseBadge,
  RequestShowcaseGrid,
  RequestShowcaseR18Section,
} from "~/components/requests/request-showcase"
import {
  RequestPlanCard,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  type CreatorRequestProfile,
  formatCoins,
  requestsGet,
} from "~/lib/requests-api"

/**
 * マイページのプラン欄: プランの横スクロールのカード、リクエストの実績（透かし入り・「プランで制作」の印）、「リクエストする」ボタン。
 * プランも自由リクエストも実績もない人には何も出さない（本人には作る入口だけ小さく出す）
 */
export function UserRequestPlansSection(props: { userId: string }) {
  const t = useTranslation()
  const auth = useContext(AuthContext)
  const [profile, setProfile] = useState<
    (CreatorRequestProfile & { users: RequestUsers }) | null
  >(null)
  const isOwner = auth.userId !== null && auth.userId === props.userId

  useEffect(() => {
    let alive = true
    requestsGet<CreatorRequestProfile & { users: RequestUsers }>({
      op: "creator",
      userId: props.userId,
    })
      .then((data) => alive && setProfile(data))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [props.userId, auth.userId])

  if (!profile) return null
  const plans = profile.plans.filter((p) => p.status === "ACTIVE" || isOwner)
  const canFree = profile.canFreeRequest && !isOwner
  const showcase = profile.showcase ?? []
  const showcaseCount = profile.showcaseCount ?? showcase.length
  const showcaseR18Count = profile.showcaseR18Count ?? 0

  if (
    plans.length === 0 &&
    !profile.canFreeRequest &&
    showcase.length === 0 &&
    showcaseR18Count === 0
  ) {
    if (!isOwner) return null
    return (
      <Link
        to="/requests/my-plans?new=1"
        className="mx-1 flex items-center gap-3 rounded-2xl border border-dashed p-3 text-sm hover:bg-muted/40"
      >
        <HandCoins className="size-5 shrink-0 text-sky-500" />
        <span className="flex-1">
          <b>
            {t(
              "プランを出品してリクエストを受けよう",
              "List a plan and receive requests",
            )}
          </b>
          <span className="block text-muted-foreground text-xs">
            {t(
              "コインで依頼が届き、完了すると受け取れます",
              "Requests are paid in coins, which you receive when done",
            )}
          </span>
        </span>
        <Plus className="size-4 text-muted-foreground" />
      </Link>
    )
  }

  const user = profile.users[props.userId]
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="flex items-center gap-1.5 font-bold text-lg">
          <HandCoins className="size-5 text-sky-500" />
          {t("リクエスト", "Requests")}
          {profile.completedCount > 0 && (
            <span className="font-normal text-muted-foreground text-xs">
              {t(
                `完了 ${profile.completedCount} 件`,
                `${profile.completedCount} completed`,
              )}
            </span>
          )}
        </h2>
        {isOwner ? (
          <Link
            to="/requests/my-plans"
            className="flex items-center text-muted-foreground text-sm hover:text-foreground"
          >
            {t("プランを編集", "Edit plans")}
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <Link
            to="/requests"
            className="flex items-center text-muted-foreground text-sm hover:text-foreground"
          >
            {t("プラン一覧", "All plans")}
            <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
      {plans.length > 0 && (
        <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {plans.map((plan) => (
            <div key={plan.id} className="snap-start">
              <RequestPlanCard
                plan={plan}
                user={user}
                compact
                showStatus={isOwner}
              />
            </div>
          ))}
        </div>
      )}
      {(showcase.length > 0 || showcaseR18Count > 0) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <h3 className="flex items-center gap-1.5 font-bold text-sm">
              {t(
                `リクエストの実績（${showcaseCount + showcaseR18Count}）`,
                `Request works (${showcaseCount + showcaseR18Count})`,
              )}
              <RequestShowcaseBadge />
            </h3>
            {showcaseCount > showcase.length && (
              <Link
                to={`/requests/showcase?userId=${props.userId}`}
                className="flex items-center text-muted-foreground text-sm hover:text-foreground"
              >
                {t("すべて見る", "See all")}
                <ChevronRight className="size-4" />
              </Link>
            )}
          </div>
          {showcase.length > 0 && (
            <RequestShowcaseGrid
              items={showcase}
              users={profile.users}
              scroll
            />
          )}
          <RequestShowcaseR18Section
            count={showcaseR18Count}
            userId={props.userId}
            users={profile.users}
            scroll
          />
        </div>
      )}
      {canFree && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 p-3">
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-bold">
              {t("内容を自由に決めてリクエスト", "Custom request")}
            </p>
            {profile.settings.note ? (
              <AutoTranslatedText
                text={profile.settings.note}
                className="truncate text-muted-foreground text-xs"
              />
            ) : (
              <p className="truncate text-muted-foreground text-xs">
                {t(
                  `${formatCoins(profile.settings.minCoins)} コインから受け付けています`,
                  `From ${formatCoins(profile.settings.minCoins, true)} coins`,
                )}
              </p>
            )}
          </div>
          <Button asChild className="shrink-0 rounded-full font-bold">
            <Link to={`/requests/new?creator=${props.userId}`}>
              {t("リクエストする", "Request")}
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}
