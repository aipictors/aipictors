import { getJstDate } from "~/utils/jst-date"
import { getRenderNow } from "~/utils/render-now"
import { useContext, useEffect, useState } from "react"
import { useSearchParams } from "@remix-run/react"
import { Link, useNavigate } from "~/lib/app/locale-router"
import { useQuery } from "@apollo/client/index"
import type { FragmentOf } from "gql.tada"
import { CalendarDaysIcon, ImagePlusIcon, LayoutGridIcon } from "lucide-react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { AuthContext } from "~/contexts/auth-context"
import {
  type ThemeListItemFragment,
  ThemeList,
} from "~/routes/($lang)._main.themes._index/components/theme-list"
import {
  themeWorksQuery,
  type ThemeWorkFragment,
} from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import { useTranslation } from "~/hooks/use-translation"
import { useUpdateQueryParams } from "~/hooks/use-update-query-params"
import { cn } from "~/lib/utils"
import { ThemeHero } from "~/routes/($lang)._main.themes._index/components/theme-hero"
import { ThemeWeekStrip } from "~/routes/($lang)._main.themes._index/components/theme-week-strip"
import { ThemeProposalCta } from "~/routes/($lang)._main.themes._index/components/theme-proposal-cta"

type RecentThemeProposal = {
  id: string
  inputTheme: string
  proposerUserId: string
  proposerName: string
  proposerIconUrl: string | null
  createdAt: number
}

type Props = {
  year: number
  month: number
  day?: number
  targetThemes?: FragmentOf<typeof ThemeListItemFragment>[]
  dailyThemes: FragmentOf<typeof ThemeListItemFragment>[]
  todayTheme: FragmentOf<typeof ThemeListItemFragment> | null
  afterSevenDayThemes: FragmentOf<typeof ThemeListItemFragment>[]
  dailyBeforeThemes: FragmentOf<typeof ThemeListItemFragment>[]
  recentThemeProposals?: RecentThemeProposal[]
  page: number
  worksCount: number
  works: FragmentOf<typeof ThemeWorkFragment>[]
  defaultTab?: "list" | "calender"
  themeId: number | null
  /** センシティブ（/r/themes）として表示する */
  isSensitive?: boolean
}

const PER_PAGE = 64

export function ThemeContainer(props: Props) {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const updateQueryParams = useUpdateQueryParams()

  const isSensitive = props.isSensitive === true

  const basePath = isSensitive ? "/r/themes" : "/themes"

  // 日付は日本時間で、hydration 中はサーバーが描画した時刻で判定する（サーバーは UTC のため、
  // その場の時刻だと「今日のお題」がずれて React がページ全体を作り直していた）
  const today = getJstDate(new Date(getRenderNow()))

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )

  const authContext = useContext(AuthContext)

  // タブは URL（?tab=）に合わせる（日付を移るリンクはタブを付けないので作品一覧に戻る）
  const urlTab = searchParams.get("tab") || props.defaultTab || "list"

  const [tab, setTab] = useState(urlTab)

  useEffect(() => {
    setTab(urlTab)
  }, [urlTab, props.year, props.month, props.day])

  // 表示しているお題の日付（日付ページはその日、一覧は今日）
  const viewDate = props.day
    ? new Date(props.year, props.month - 1, props.day)
    : todayStart

  const viewTheme = props.day
    ? (props.targetThemes?.[0] ?? null)
    : props.todayTheme

  const [date, setDate] = useState(toInputDate(viewDate))

  const t = useTranslation()

  const { data: resp } = useQuery(themeWorksQuery, {
    skip:
      authContext.isLoading ||
      authContext.isNotLoggedIn ||
      props.themeId === null,
    variables: {
      offset: props.page * PER_PAGE,
      limit: PER_PAGE,
      where: {
        subjectId: props.themeId ?? 0,
        ratings: isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        orderBy: "DATE_CREATED",
        isNowCreatedAt: true,
      },
    },
  })

  const works = resp?.works ?? props.works

  useEffect(() => {
    setDate(toInputDate(viewDate))
  }, [props.year, props.month, props.day])

  const handleTabChange = (tab: string) => {
    setTab(tab)
    searchParams.set("tab", tab)
    updateQueryParams(searchParams)
  }

  const lastDay = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate() + 7,
  )

  const shiftDay = (offset: number) => {
    const target = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      viewDate.getDate() + offset,
    )
    if (target > lastDay) {
      return
    }
    navigateToDate(target)
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value
    setDate(newDate)
    if (/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      const [year, month, day] = newDate.split("-").map(Number)
      navigateToDate(new Date(year, month - 1, day))
    }
  }

  const navigateToDate = (date: Date) => {
    navigate(
      `${basePath}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
    )
  }

  const timing =
    viewDate.getTime() === todayStart.getTime()
      ? "today"
      : viewDate > todayStart
        ? "future"
        : "past"

  const viewDateKey = `${viewDate.getFullYear()}-${viewDate.getMonth() + 1}-${viewDate.getDate()}`

  const todayKey = `${todayStart.getFullYear()}-${todayStart.getMonth() + 1}-${todayStart.getDate()}`

  const datePath = `${viewDate.getFullYear()}/${viewDate.getMonth() + 1}/${viewDate.getDate()}`

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-bold text-2xl">{t("お題", "Theme")}</h1>
          <div
            role="group"
            aria-label={t("年齢区分", "Rating")}
            className="inline-flex shrink-0 rounded-full border bg-muted/50 p-1"
          >
            <Link
              to={`/themes/${datePath}`}
              aria-current={isSensitive ? undefined : "page"}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition md:px-4 md:py-1.5 md:text-sm",
                isSensitive
                  ? "text-muted-foreground hover:text-foreground"
                  : "bg-background font-semibold shadow-sm",
              )}
            >
              {t("全年齢", "All ages")}
            </Link>
            <Link
              to={`/r/themes/${datePath}`}
              aria-current={isSensitive ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition md:px-4 md:py-1.5 md:text-sm",
                isSensitive
                  ? "bg-background font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("センシティブ", "Sensitive")}
            </Link>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          {t(
            "毎日0時に新しいお題が出ます。お題に沿った作品を投稿して参加しよう！",
            "A new theme every day at 0:00 (JST). Join by posting a work for the theme!",
          )}
        </p>
      </div>

      <ThemeHero
        theme={viewTheme}
        year={viewDate.getFullYear()}
        month={viewDate.getMonth() + 1}
        day={viewDate.getDate()}
        worksCount={props.worksCount}
        timing={timing}
        isSensitive={isSensitive}
        hasPreviousDay={true}
        hasNextDay={
          new Date(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            viewDate.getDate() + 1,
          ) <= lastDay
        }
        onPreviousDay={() => shiftDay(-1)}
        onNextDay={() => shiftDay(1)}
      />

      <ThemeWeekStrip
        themes={props.dailyBeforeThemes}
        selectedKey={viewDateKey}
        todayKey={todayKey}
        selectedWorksCount={props.worksCount}
        isSensitive={isSensitive}
        basePath={basePath}
      />

      {!isSensitive && (
        <ThemeProposalCta proposals={props.recentThemeProposals ?? []} />
      )}

      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="rounded-full">
            <TabsTrigger value="list" className="gap-1.5 rounded-full px-4">
              <LayoutGridIcon className="size-4" />
              {t("作品", "Works")}
              <span className="text-muted-foreground text-xs">
                {props.worksCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="calender" className="gap-1.5 rounded-full px-4">
              <CalendarDaysIcon className="size-4" />
              {t("カレンダー", "Calendar")}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label={t("日付を選ぶ", "Pick a date")}
              value={date}
              max={toInputDate(lastDay)}
              onChange={handleDateChange}
              className="h-9 w-40 rounded-full"
            />
            {timing !== "today" && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full"
                onClick={() => navigate(basePath)}
              >
                {t("今日に戻る", "Back to today")}
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="list" className="m-0 flex flex-col gap-4">
          {works && works.length > 0 ? (
            <ResponsivePhotoWorksAlbum
              works={works}
              isShowProfile={true}
              priorityCount={4}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-14 text-center">
              <p className="font-semibold">
                {timing === "future"
                  ? t("まだ公開前のお題です", "This theme hasn't opened yet")
                  : timing === "today"
                    ? t(
                        "まだ作品がありません。一番乗りしよう！",
                        "No works yet. Be the first!",
                      )
                    : t("作品はありません", "No works")}
              </p>
              {timing === "today" && viewTheme && (
                <Button asChild className="rounded-full">
                  <Link to={`/new/image?theme=${viewTheme.id}`}>
                    <ImagePlusIcon className="mr-2 size-4" />
                    {t("このお題で投稿する", "Post for this theme")}
                  </Link>
                </Button>
              )}
            </div>
          )}
          {props.worksCount > PER_PAGE && (
            <ResponsivePagination
              maxCount={props.worksCount}
              perPage={PER_PAGE}
              currentPage={props.page}
              onPageChange={(page: number) => {
                if (props.day) {
                  navigate(`${basePath}/${datePath}?page=${page}`)
                } else {
                  navigate(`${basePath}?page=${page}`)
                }
              }}
            />
          )}
        </TabsContent>
        <TabsContent value="calender" className="m-0">
          <ThemeList
            year={props.year}
            month={props.month}
            dailyThemes={props.dailyThemes}
            basePath={basePath}
            isSensitive={isSensitive}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function toInputDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
