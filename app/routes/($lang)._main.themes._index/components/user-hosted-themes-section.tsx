import { gql, useQuery } from "@apollo/client/index"
import { CrownIcon, PlusIcon, UsersIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"

type UserHostedTheme = {
  id: string
  slug: string
  title: string
  thumbnailImageUrl: string | null
  headerImageUrl: string | null
  mainTag: string
  status: string
  remainingDays: number
  entryCount: number
  userName: string | null
  isOfficial: boolean
}

/**
 * みんなが主催するお題（開催中のユーザー企画）と「お題を立てる」入り口
 */
export function UserHostedThemesSection() {
  const t = useTranslation()
  const { data } = useQuery<{ userEvents: UserHostedTheme[] }>(
    userHostedThemesQuery,
    {
      fetchPolicy: "cache-first",
      variables: {
        limit: 12,
        offset: 0,
        where: { status: "ONGOING", isSensitive: false, sort: "TRENDING" },
      },
    },
  )
  const themes = data?.userEvents ?? []
  // 公式の枠（ピックアップモデルのお題）を先頭に
  const sorted = [
    ...themes.filter((theme) => theme.isOfficial),
    ...themes.filter((theme) => !theme.isOfficial),
  ]

  return (
    <section className="space-y-3 rounded-3xl border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 font-bold text-base">
            <UsersIcon className="size-4" />
            {t("みんなが主催するお題", "Themes hosted by users")}
          </h2>
          <p className="text-muted-foreground text-xs">
            {t(
              "期間・タグを決めて、誰でもお題を立てられます。参加作品はタグで集まり、いいね順のランキングも作れます。",
              "Anyone can host a theme with its own period and tag. Entries are gathered by tag, with an optional likes ranking.",
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/events/user-events">{t("すべて見る", "See all")}</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/themes/new">
              <PlusIcon className="mr-1 size-4" />
              {t("お題を立てる", "Host a theme")}
            </Link>
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed px-4 py-6 text-center text-muted-foreground text-sm">
          {t(
            "開催中のお題はまだありません。最初のお題を立ててみませんか？",
            "No themes yet. Why not host the first one?",
          )}
        </p>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
          {sorted.map((theme) => {
            const image = theme.thumbnailImageUrl || theme.headerImageUrl
            return (
              <Link
                key={theme.id}
                to={`/events/${theme.slug}`}
                className={cn(
                  "group flex w-48 shrink-0 flex-col overflow-hidden rounded-2xl border bg-background transition-colors hover:bg-muted/40",
                  theme.isOfficial && "border-amber-400/60",
                )}
              >
                <div className="relative aspect-video bg-muted">
                  {image && (
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  )}
                  {theme.isOfficial && (
                    <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 font-semibold text-[10px] text-white">
                      <CrownIcon className="size-3" />
                      {t("ピックアップ", "Pickup")}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-2.5">
                  <p className="line-clamp-2 font-semibold text-sm leading-snug group-hover:underline">
                    {theme.title}
                  </p>
                  <p className="truncate text-muted-foreground text-xs">
                    #{theme.mainTag}
                  </p>
                  <p className="mt-auto flex justify-between text-muted-foreground text-xs">
                    <span className="truncate">
                      {theme.isOfficial ? "Aipictors" : (theme.userName ?? "")}
                    </span>
                    <span className="shrink-0">
                      {theme.entryCount}
                      {t("作品", " works")}
                      {" · "}
                      {theme.remainingDays <= 0
                        ? t("今日まで", "Ends today")
                        : t(`残り${theme.remainingDays}日`, `${theme.remainingDays}d left`)}
                    </span>
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

const userHostedThemesQuery = gql`
  query UserHostedThemes($limit: Int!, $offset: Int!, $where: UserEventsWhereInput) {
    userEvents(limit: $limit, offset: $offset, where: $where) {
      id
      slug
      title
      thumbnailImageUrl
      headerImageUrl
      mainTag
      status
      remainingDays
      entryCount
      userName
      isOfficial
    }
  }
`
