import { useQuery } from "@apollo/client/index"
import { ChevronLeftIcon, ChevronRightIcon, TrophyIcon } from "lucide-react"
import { useContext } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { LoginDialogButton } from "~/components/login-dialog-button"
import {
  PopularWorksQuery,
  sortPopularWorks,
} from "~/components/popular-works/popular-works-query"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import type { ResultOf } from "gql.tada"
import {
  POPULAR_WORKS_FIRST_DATE,
  shiftDateString,
  toPopularWorksPath,
} from "~/utils/popular-works-date"

type PopularWork = ResultOf<typeof PopularWorksQuery>["popularWorks"][number]

type Props = {
  date: string
  today: string
  isSensitive: boolean
  /** 全年齢の作品（loader で読んだもの）。R18 はここで読む */
  works: PopularWork[]
}

/**
 * 今日の人気作品（毎日お昼に、投稿から 2 週間以上の画像作品からいいねの多い順に 1 人 1 作品で 100 件選ばれる）
 */
export function PopularWorksPage(props: Props) {
  const t = useTranslation()
  const navigate = useNavigate()

  const [year, month, day] = props.date.split("-")
  const dateLabel = t(
    `${year}年${Number(month)}月${Number(day)}日`,
    new Date(`${props.date}T00:00:00Z`).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
  )

  const previousDate = shiftDateString(props.date, -1)
  const nextDate = shiftDateString(props.date, 1)
  const hasPrevious = POPULAR_WORKS_FIRST_DATE <= previousDate
  const hasNext = nextDate <= props.today

  const toPath = (date: string, isSensitive = props.isSensitive) =>
    toPopularWorksPath({ isSensitive, date })

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-3 pb-8 sm:px-4 lg:px-0">
      <div className="space-y-4 rounded-[28px] border border-border/40 bg-background/85 p-4 shadow-sm sm:p-5">
        <div className="space-y-1.5">
          <h1 className="flex items-center gap-2 font-semibold text-foreground text-lg sm:text-xl">
            <TrophyIcon className="size-5 text-amber-500" />
            {props.isSensitive
              ? t("今日のR18人気作品", "Today's popular R18 works")
              : t("今日の人気作品", "Today's popular works")}
            <span className="font-normal text-muted-foreground text-sm">
              {dateLabel}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              "毎日お昼に、投稿から2週間以上たった画像作品の中から、いいねの多い作品を1人1作品ずつ選んでいます（その日のベスト作品と、60日以内に選ばれた作品を除く）。",
              "Every day at noon, we pick image works posted at least two weeks ago with the most likes, one per creator (excluding the day's best works and works picked in the last 60 days).",
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 p-1">
            <RatingTab
              label={t("全年齢", "All ages")}
              to={toPath(props.date, false)}
              isActive={!props.isSensitive}
              activeClassName="bg-foreground text-background"
            />
            <RatingTab
              label="R18"
              to={toPath(props.date, true)}
              isActive={props.isSensitive}
              activeClassName="bg-rose-600 text-white"
            />
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-full"
              disabled={!hasPrevious}
              aria-label={t("前の日", "Previous day")}
              onClick={() => navigate(toPath(previousDate))}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <input
              type="date"
              aria-label={t("日付を選ぶ", "Choose a date")}
              className="h-9 rounded-full border border-input bg-background px-3 text-sm"
              value={props.date}
              min={POPULAR_WORKS_FIRST_DATE}
              max={props.today}
              onChange={(event) => {
                const value = event.target.value
                if (value) navigate(toPath(value))
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-full"
              disabled={!hasNext}
              aria-label={t("次の日", "Next day")}
              onClick={() => navigate(toPath(nextDate))}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>

          <Link
            to={props.isSensitive ? "/r/rankings" : "/rankings"}
            className="text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("ランキングを見る", "See rankings")}
          </Link>
        </div>
      </div>

      {props.isSensitive ? (
        <SensitivePopularWorks date={props.date} />
      ) : (
        <PopularWorksGrid works={props.works} />
      )}
    </div>
  )
}

function RatingTab(props: {
  label: string
  to: string
  isActive: boolean
  activeClassName: string
}) {
  const className = "inline-flex h-9 items-center rounded-full px-4 text-sm"
  if (props.isActive) {
    return (
      <span className={cn(className, "font-medium", props.activeClassName)}>
        {props.label}
      </span>
    )
  }
  return (
    <Link
      to={props.to}
      className={cn(
        className,
        "text-muted-foreground hover:bg-background hover:text-foreground",
      )}
    >
      {props.label}
    </Link>
  )
}

function PopularWorksGrid(props: { works: PopularWork[] }) {
  const t = useTranslation()

  if (props.works.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground text-sm">
        {t("この日の人気作品はありません", "No popular works for this day")}
      </p>
    )
  }

  return (
    <ResponsivePhotoWorksAlbum
      works={props.works}
      isShowProfile={true}
      priorityCount={8}
    />
  )
}

/**
 * R18 の人気作品は、ログインして R18 を表示する設定の人にだけ API が返すので、画面で読む
 */
function SensitivePopularWorks(props: { date: string }) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const { data, loading } = useQuery(PopularWorksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: { where: { date: props.date, isSensitive: true } },
  })

  if (authContext.isLoading || loading) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          {t(
            "R18 の人気作品はログインすると見られます",
            "Log in to see popular R18 works",
          )}
        </p>
        <LoginDialogButton label={t("ログイン", "Log in")} />
      </div>
    )
  }

  const works = sortPopularWorks(data?.popularWorks ?? [])

  if (works.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground text-sm">
        <p>
          {t("この日の人気作品はありません", "No popular works for this day")}
        </p>
        <Link
          to="/settings/restriction"
          className="underline underline-offset-4 hover:text-foreground"
        >
          {t(
            "R18 の作品を表示する設定を確かめる",
            "Check your R18 display settings",
          )}
        </Link>
      </div>
    )
  }

  return <PopularWorksGrid works={works} />
}
