import type React from "react"
import { useContext, useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "@remix-run/react"
import { useQuery } from "@apollo/client/index"
import type { FragmentOf } from "gql.tada"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { AppPageHeader } from "~/components/app/app-page-header"
import { ConstructionAlert } from "~/components/construction-alert"
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

export function ThemeContainer(props: Props) {
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
        ratings: ["G", "R15"],
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
      `/themes/${previousDay.getFullYear()}/${previousDay.getMonth() + 1}/${previousDay.getDate()}`,
    )
  }

  const handleNextDay = (event: React.MouseEvent) => {
    event.stopPropagation()

    const nextDay = props.day
      ? new Date(props.year, props.month - 1, props.day + 1)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    navigate(
      `/themes/${nextDay.getFullYear()}/${nextDay.getMonth() + 1}/${nextDay.getDate()}`,
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
    navigate(`/themes/${year}/${month}/${day}`)
  }

  const description = t(
    "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう！午前0時に更新されます。",
    "Themes are updated daily. Create and submit AI illustrations according to the theme! The update happens at 0:00 AM.",
  )

  return (
    <div className="flex flex-col space-y-4">
      <ConstructionAlert
        type="WARNING"
        message={t(
          "リニューアル版はすべて開発中のため不具合が起きる可能性があります！一部機能を新しくリリースし直しています！基本的には旧版をそのままご利用ください！",
          "The renewed version is under development, so there may be bugs! Some features are being re-released. Please use the old version for now!",
        )}
        fallbackURL="https://www.aipictors.com/idea"
      />
      <AppPageHeader title={t("お題", "Theme")} description={description} />

      {!props.day && props.todayTheme && (
        <div className="relative overflow-hidden rounded-md">
          <Link
            to={`/themes/${props.todayTheme.year}/${props.todayTheme.month}/${props.todayTheme.day}`}
            className="relative block h-24 overflow-hidden rounded-md p-4"
          >
            <h2 className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-10 transform text-center font-bold text-white">
              {t("今日のお題は", "Today's theme is")}
              <br />「{props.todayTheme.title}」
            </h2>
            <img
              className="absolute top-0 left-0 w-full"
              src={props.todayTheme.firstWork?.smallThumbnailImageURL}
              alt={props.todayTheme.title}
            />
            <div className="absolute top-0 left-0 h-full w-full bg-black opacity-40" />
          </Link>
        </div>
      )}

      {props.day && props.targetThemes && props.targetThemes.length > 0 && (
        <div className="relative h-24 overflow-hidden rounded-md">
          <div className="relative overflow-hidden rounded-md">
            <Link
              to={`/themes/${props.targetThemes[0].year}/${props.targetThemes[0].month}/${props.targetThemes[0].day}`}
              className="relative block h-24 overflow-hidden rounded-md p-4"
            >
              <h2 className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-10 transform text-center font-bold text-white">
                <p>{`${props.targetThemes[0].year}月${props.targetThemes[0].month}月${props.targetThemes[0].day}日`}</p>
                <p className="text-mx">「{props.targetThemes[0].title}」</p>
                <p className="text-md">
                  {t("作品数", "Number of works")}: {props.worksCount}
                </p>
              </h2>
              <img
                className="absolute top-0 left-0 w-full"
                src={props.targetThemes[0].firstWork?.smallThumbnailImageURL}
                alt={props.targetThemes[0].title}
              />
              <div className="absolute top-0 left-0 h-full w-full bg-black opacity-40" />
            </Link>
          </div>
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
              className="flex items-center p-2"
            >
              {t("翌日", "Next Day")}
              <ArrowRightIcon />
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
                      link={`/themes/${theme.year}/${theme.month}/${theme.day}`}
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
          <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <ResponsivePagination
              maxCount={props.worksCount || 0}
              perPage={64}
              currentPage={props.page}
              onPageChange={(page: number) => {
                if (props.day) {
                  navigate(
                    `/themes/${props.year}/${props.month}/${props.day}?page=${page}`,
                  )
                } else {
                  navigate(`/themes?page=${page}`)
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
