import type React from "react"
import { useContext, useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "@remix-run/react"
import { useQuery } from "@apollo/client/index"
import type { FragmentOf } from "gql.tada"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { AppPageHeader } from "~/components/app/app-page-header"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { AuthContext } from "~/contexts/auth-context"
import { TagButton } from "~/routes/($lang)._main._index/components/tag-button"
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

type Props = {
  year: number
  month: number
  day?: number
  targetThemes?: FragmentOf<typeof ThemeListItemFragment>[]
  dailyThemes: FragmentOf<typeof ThemeListItemFragment>[]
  todayTheme: FragmentOf<typeof ThemeListItemFragment> | null
  afterSevenDayThemes: FragmentOf<typeof ThemeListItemFragment>[]
  dailyBeforeThemes: FragmentOf<typeof ThemeListItemFragment>[]
  page: number
  worksCount: number
  works: FragmentOf<typeof ThemeWorkFragment>[]
  defaultTab?: "list" | "calender"
  themeId: number
}

export function SensitiveThemeContainer(props: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const updateQueryParams = useUpdateQueryParams()
  const today = new Date()
  const authContext = useContext(AuthContext)

  const [tab, setTab] = useState(
    searchParams.get("tab") || props.defaultTab || "list",
  )
  const [date, setDate] = useState(
    props.day
      ? `${props.year}-${String(props.month).padStart(2, "0")}-${String(props.day).padStart(2, "0")}`
      : "",
  )

  const t = useTranslation()

  const { data: resp } = useQuery(themeWorksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 64,
      limit: 64,
      where: {
        subjectId: props.themeId,
        ratings: ["R18", "R18G"],
        orderBy: "DATE_CREATED",
        isNowCreatedAt: true,
      },
    },
  })

  const works = resp?.works ?? props.works

  useEffect(() => {
    setTab("list")
  }, [props.day])

  const handleTabChange = (tab: string) => {
    searchParams.set("tab", tab)
    updateQueryParams(searchParams)
  }

  const isToday = (year: number, month: number, day: number) => {
    const targetDate = new Date(year, month - 1, day)
    if (props.day) {
      return (
        targetDate.getFullYear() === props.year &&
        targetDate.getMonth() === props.month - 1 &&
        targetDate.getDate() === props.day
      )
    }
    return (
      targetDate.getFullYear() === today.getFullYear() &&
      targetDate.getMonth() === today.getMonth() &&
      targetDate.getDate() === today.getDate()
    )
  }

  const handlePreviousDay = (event: React.MouseEvent) => {
    event.stopPropagation()

    const previousDay = props.day
      ? new Date(props.year, props.month - 1, props.day - 1)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)

    navigate(
      `/r/themes/${previousDay.getFullYear()}/${previousDay.getMonth() + 1}/${previousDay.getDate()}`,
    )
  }

  const handleNextDay = (event: React.MouseEvent) => {
    event.stopPropagation()

    const nextDay = props.day
      ? new Date(props.year, props.month - 1, props.day + 1)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // 今日の日付から7日後を計算
    const sevenDaysFromNow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7,
    )

    // 7日後以降なら処理を中断
    if (nextDay > sevenDaysFromNow) {
      return
    }

    navigate(
      `/r/themes/${nextDay.getFullYear()}/${nextDay.getMonth() + 1}/${nextDay.getDate()}`,
    )
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value
    setDate(newDate)
    if (newDate) {
      navigateToDate(new Date(newDate))
    }
  }

  const handleTodayClick = () => {
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    setDate(formattedDate)
    navigateToDate(today)
  }

  const navigateToDate = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    navigate(`/r/themes/${year}/${month}/${day}`)
  }

  const description = t(
    "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう！午前0時に更新されます。",
    "Themes are updated daily. Create and submit AI illustrations according to the theme! The update happens at 0:00 AM.",
  )

  return (
    <div className="flex flex-col space-y-4">
      <AppPageHeader title={t("お題", "Theme")} description={description} />
      {!props.day && props.todayTheme && (
        <div className="relative overflow-hidden rounded-md">
          <Link
            to={`/themes/${props.todayTheme.year}/${props.todayTheme.month}/${props.todayTheme.day}`}
            className="relative text-left"
          >
            <h2 className="text-sm">
              {t("今日のお題は", "Today's theme is")}「{props.todayTheme.title}
              」
            </h2>
          </Link>
        </div>
      )}

      {props.day && props.targetThemes && props.targetThemes.length > 0 && (
        <div className="relative overflow-hidden rounded-md">
          <Link
            to={`/themes/${props.targetThemes[0].year}/${props.targetThemes[0].month}/${props.targetThemes[0].day}`}
            className="relative"
          >
            <h2 className="text-sm">
              {`${props.targetThemes[0].year}月${props.targetThemes[0].month}月${props.targetThemes[0].day}日`}
              「{props.targetThemes[0].title}」{t("作品数", "Number of works")}:{" "}
              {props.worksCount}
            </h2>
          </Link>
        </div>
      )}

      <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0">
        <div className="flex flex-col gap-x-2 gap-y-4 md:flex-row">
          <div className="flex gap-x-2">
            <Button
              variant={"secondary"}
              onClick={handlePreviousDay}
              className="flex items-center p-2"
            >
              <ArrowLeftIcon />
              {t("前日", "Previous Day")}
            </Button>
            <Button
              variant={"secondary"}
              onClick={handleNextDay}
              disabled={
                props.day
                  ? new Date(props.year, props.month - 1, props.day + 1) >
                    new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate() + 7,
                    )
                  : new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate() + 1,
                    ) >
                    new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate() + 7,
                    )
              }
              className="flex items-center p-2"
            >
              {t("翌日", "Next Day")}
              <ArrowRightIcon />
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  `/themes/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`,
                )
              }
            >
              <div className="flex cursor-pointer items-center space-x-2 text-sm">
                <p>{t("全年齢", "All ages")}</p>
              </div>
            </Button>
          </div>
          <div className="flex gap-x-2">
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="w-[200px]"
              />
            </div>
            <Button onClick={handleTodayClick} variant="outline">
              {t("本日", "Today")}
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue={tab}
        value={tab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger onClick={() => setTab("list")} value="list">
            <div className="w-full">{t("作品一覧", "Work List")}</div>
          </TabsTrigger>
          <TabsTrigger onClick={() => setTab("calender")} value="calender">
            <div className="w-full">{t("カレンダー", "Calendar")}</div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="m-0 flex flex-col space-y-4">
          <Carousel
            className="relative overflow-hidden"
            opts={{ dragFree: true, loop: false, align: "center" }}
          >
            <CarouselContent>
              {props.dailyBeforeThemes.length > 0 &&
                props.dailyBeforeThemes.map((theme) => (
                  <CarouselItem className="basis-auto" key={theme.id}>
                    <TagButton
                      link={`/r/themes/${theme.year}/${theme.month}/${theme.day}`}
                      name={theme.title}
                      isDisabled={
                        new Date(theme.year, theme.month - 1, theme.day) >
                        new Date()
                      }
                      title={`${theme.year}/${theme.month}/${theme.day}`}
                      border={isToday(theme.year, theme.month, theme.day)}
                    />
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute top-1/2 left-0" />
            <CarouselNext className="absolute top-1/2 right-0" />
          </Carousel>
          {works && works.length > 0 && (
            <div className="mt-4">
              <ResponsivePhotoWorksAlbum works={works} isShowProfile={true} />
            </div>
          )}
          <div className="h-8" />
          <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
            <ResponsivePagination
              maxCount={props.worksCount || 0}
              perPage={64}
              currentPage={props.page}
              onPageChange={(page: number) => {
                if (props.day) {
                  navigate(
                    `/r/themes/${props.year}/${props.month}/${props.day}?page=${page}`,
                  )
                } else {
                  navigate(`/r/themes?page=${page}`)
                }
              }}
            />
          </div>
        </TabsContent>
        <TabsContent value="calender">
          <ThemeList
            year={props.year}
            month={props.month}
            dailyThemes={props.dailyThemes}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
