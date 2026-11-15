import { ChevronRight, HandCoins, Plus } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import {
  RequestPlanCard,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"
import {
  type CreatorRequestProfile,
  formatCoins,
  requestsGet,
} from "~/lib/requests-api"

/**
 * マイページのプラン欄: プランの横スクロールのカードと「リクエストする」ボタン。
 * プランも自由リクエストもない人には何も出さない（本人には作る入口だけ小さく出す）
 */
export function UserRequestPlansSection(props: { userId: string }) {
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

  if (plans.length === 0 && !profile.canFreeRequest) {
    if (!isOwner) return null
    return (
      <Link
        to="/settings/requests"
        className="mx-1 flex items-center gap-3 rounded-2xl border border-dashed p-3 text-sm hover:bg-muted/40"
      >
        <HandCoins className="size-5 shrink-0 text-sky-500" />
        <span className="flex-1">
          <b>プランを出品してリクエストを受けよう</b>
          <span className="block text-muted-foreground text-xs">
            コインで依頼が届き、完了すると受け取れます
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
          リクエスト
          {profile.completedCount > 0 && (
            <span className="font-normal text-muted-foreground text-xs">
              完了 {profile.completedCount} 件
            </span>
          )}
        </h2>
        {isOwner ? (
          <Link
            to="/settings/requests"
            className="flex items-center text-muted-foreground text-sm hover:text-foreground"
          >
            プランを編集
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <Link
            to="/requests/plans"
            className="flex items-center text-muted-foreground text-sm hover:text-foreground"
          >
            プラン一覧
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
      {canFree && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 p-3">
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-bold">内容を自由に決めてリクエスト</p>
            <p className="truncate text-muted-foreground text-xs">
              {profile.settings.note ||
                `${formatCoins(profile.settings.minCoins)} コインから受け付けています`}
            </p>
          </div>
          <Button asChild className="shrink-0 rounded-full font-bold">
            <Link to={`/requests/new?creator=${props.userId}`}>
              リクエストする
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}
