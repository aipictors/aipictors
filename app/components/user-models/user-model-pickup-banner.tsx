import { useQuery } from "@tanstack/react-query"
import { ArrowRightIcon, CrownIcon, SparklesIcon, TrophyIcon } from "lucide-react"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import { UserModelAuthor } from "~/components/user-models/user-model-author"
import {
  UserModelBaseBadge,
  UserModelKindBadge,
} from "~/components/user-models/user-model-badges"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { fetchUserModelPickup } from "~/lib/user-models/client"
import { formatCount } from "~/lib/user-models/generation"
import type { UserModelPickup } from "~/lib/user-models/types"
import { cn } from "~/lib/utils"

export const userModelPickupQueryKey = ["user-models", "pickup"] as const

/**
 * 今週のピックアップモデル（週に 1 回しか変わらないので 10 分使い回す）
 */
export function useUserModelPickup() {
  return useQuery({
    queryKey: userModelPickupQueryKey,
    queryFn: fetchUserModelPickup,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}

const formatWeek = (pickup: UserModelPickup) => {
  const md = (ymd: string) => `${Number(ymd.slice(5, 7))}/${Number(ymd.slice(8, 10))}`
  return `${md(pickup.weekStart)}〜${md(pickup.weekEnd)}`
}

type Props = {
  /**
   * full: ホーム・モデル一覧の看板 / compact: 生成画面の上の 1 行
   */
  variant?: "full" | "compact"
  className?: string
}

/**
 * 週替わりのピックアップモデルの看板。
 * 「このモデルで生成 → そのまま投稿」の入り口と、その週のお題（ランキング）への導線
 */
export function UserModelPickupBanner(props: Props) {
  const t = useTranslation()
  const { data: pickup } = useUserModelPickup()
  const authContext = useContext(AuthContext)

  if (!pickup) {
    return null
  }

  const { model } = pickup
  const generateUrl = `/generation?userModel=${model.id}`
  const eventUrl = pickup.eventSlug ? `/events/${pickup.eventSlug}` : null
  const images = [model.thumbnailUrl, ...model.sampleImageUrls]
    .filter((url): url is string => typeof url === "string" && url !== "")
    .filter((url, index, list) => list.indexOf(url) === index)

  if (props.variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-pink-500/5 to-transparent p-2 pr-3",
          props.className,
        )}
      >
        {images[0] && (
          <img
            src={images[0]}
            alt=""
            className="size-11 shrink-0 rounded-lg object-cover"
            loading="lazy"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 font-medium text-[11px] text-amber-700 dark:text-amber-300">
            <CrownIcon className="size-3" />
            {t("今週のピックアップモデル", "Model of the week")}
            <span className="text-muted-foreground">{formatWeek(pickup)}</span>
          </p>
          <Link
            to={`/models/u/${model.id}`}
            className="line-clamp-1 font-semibold text-sm hover:underline"
          >
            {model.name}
          </Link>
        </div>
        <Button asChild size="sm" className="shrink-0 rounded-full">
          <Link to={generateUrl}>
            <SparklesIcon className="mr-1 size-3.5" />
            {t("使う", "Use")}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-pink-500/10 to-violet-500/10",
        props.className,
      )}
      aria-label={t("今週のピックアップモデル", "Model of the week")}
    >
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6 md:p-5">
        <Link
          to={`/models/u/${model.id}`}
          className="flex shrink-0 gap-1.5 overflow-hidden"
        >
          {images.slice(0, 3).map((url, index) => (
            <img
              key={url}
              src={url}
              alt={index === 0 ? model.name : ""}
              loading="lazy"
              className={cn(
                "aspect-[3/4] rounded-xl object-cover shadow-sm",
                index === 0 ? "w-28 md:w-32" : "hidden w-20 sm:block md:w-24",
              )}
            />
          ))}
        </Link>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="flex flex-wrap items-center gap-1.5 font-semibold text-amber-700 text-xs dark:text-amber-300">
            <CrownIcon className="size-3.5" />
            {t("今週のピックアップモデル", "Model of the week")}
            <span className="font-normal text-muted-foreground">
              {formatWeek(pickup)}
            </span>
          </p>
          <h2 className="line-clamp-2 font-bold text-lg leading-snug md:text-xl">
            <Link to={`/models/u/${model.id}`} className="hover:underline">
              {model.name}
            </Link>
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              {t("登録", "By")}
              <UserModelAuthor userId={model.userId} user={model.user} linked />
            </span>
            {model.sourceCreator && (
              <span>
                {t("制作", "Creator")}: {model.sourceCreator}
              </span>
            )}
            <span className="flex items-center gap-1">
              <UserModelKindBadge kind={model.kind} />
              <UserModelBaseBadge baseModel={model.baseModel} />
            </span>
            <span>
              {t("使用", "Used")} {formatCount(model.useCount)}
              {t("回", " times")}
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(
              "ユーザーが作ったモデルで生成して、そのまま投稿できます。",
              "Generate with a model made by our users and post it right away.",
            )}
            {eventUrl &&
              t(
                `投稿するとタグ「${pickup.eventTag}」で今週のランキングに参加できます。`,
                ` Posts join this week's ranking with the tag "${pickup.eventTag}".`,
              )}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild className="rounded-full">
              <Link to={generateUrl}>
                <SparklesIcon className="mr-1.5 size-4" />
                {t("このモデルで生成", "Generate with this model")}
              </Link>
            </Button>
            {eventUrl && (
              <Button asChild variant="outline" className="rounded-full">
                <Link to={eventUrl}>
                  <TrophyIcon className="mr-1.5 size-4" />
                  {t("お題・ランキング", "Theme & ranking")}
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/models">
                {t("ほかのモデル", "More models")}
                <ArrowRightIcon className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
          {!authContext.isLoading && !authContext.isLoggedIn && (
            <p className="text-muted-foreground text-xs">
              {t(
                "無料の会員登録で、みんなのモデルを使って生成できます。",
                "Sign up for free to generate with community models.",
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
