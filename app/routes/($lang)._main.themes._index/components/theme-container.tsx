import { Link, useNavigate, useSearchParams } from "@remix-run/react"
import { AppPageHeader } from "~/components/app/app-page-header"
import { ConstructionAlert } from "~/components/construction-alert"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { TagButton } from "~/routes/($lang)._main._index/components/tag-button"
import {
  type ThemeListItemFragment,
  ThemeList,
} from "~/routes/($lang)._main.themes._index/components/theme-list"
import {
  themeWorksQuery,
  type ThemeWorkFragment,
} from "~/routes/($lang)._main.themes.$year.$month.$day._index/components/theme-article"
import type { FragmentOf } from "gql.tada"
import React, { useContext, useEffect } from "react"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"

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
  isSensitive?: boolean
  themeId: string
}

const useUpdateQueryParams = () => {
  const updateQueryParams = (newParams: URLSearchParams) => {
    const newUrl = `${window.location.pathname}?${newParams.toString()}`
    window.history.replaceState(null, "", newUrl)
  }
  return updateQueryParams
}

/**
 * お題コンテナ
 */
export function ThemeContainer(props: Props) {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const updateQueryParams = useUpdateQueryParams()

  const handleTabChange = (tab: string) => {
    searchParams.set("tab", tab)
    updateQueryParams(searchParams)
  }

  const description =
    "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう！午前0時に更新されます。"

  const authContext = useContext(AuthContext)

  console.log(props.themeId)

  const { data: resp } = useQuery(themeWorksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        subjectId: Number(props.themeId),
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        orderBy: "DATE_CREATED",
        isNowCreatedAt: true,
      },
    },
  })

  const works = resp?.works ?? props.works

  const [tab, setTab] = React.useState(
    searchParams.get("tab") || props.defaultTab || "list",
  )

  const onChangeListTab = () => {
    searchParams.set("tab", "list")
    updateQueryParams(searchParams)
    setTab("list")
  }

  useEffect(() => {
    setTab("list")
  }, [props.day])

  return (
    <div className="flex flex-col space-y-4">
      <ConstructionAlert
        type="WARNING"
        message="リニューアル版はすべて開発中のため不具合が起きる可能性があります！一部機能を新しくリリースし直しています！基本的には旧版をそのままご利用ください！"
        fallbackURL="https://www.aipictors.com/idea"
      />
      <AppPageHeader title={"お題"} description={description} />
      {!props.day && props.todayTheme && (
        <Link
          to={`/themes/${props.todayTheme.year}/${props.todayTheme.month}/${props.todayTheme.day}`}
          className="relative block h-24 overflow-hidden rounded-md p-4"
        >
          <h2 className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-10 transform text-center font-bold text-white">
            {"今日のお題は"}
            <br />「{props.todayTheme.title}」
          </h2>
          <img
            className="absolute top-0 left-0 w-full"
            src={props.todayTheme.firstWork?.smallThumbnailImageURL}
            alt={props.todayTheme.title}
          />
          <div className="absolute top-0 left-0 h-full w-full bg-black opacity-40" />
        </Link>
      )}
      {props.day && props.targetThemes && props.targetThemes.length && (
        <div className="relative h-48 overflow-hidden rounded-md ">
          <img
            src={props.targetThemes[0].firstWork?.smallThumbnailImageURL ?? ""}
            alt={""}
            className="absolute top-0 left-0 z-0 m-auto blur-[240px]"
          />
          <img
            src={props.targetThemes[0].firstWork?.smallThumbnailImageURL ?? ""}
            alt={""}
            className="absolute top-0 left-0 m-auto object-contain"
          />
          <div className="absolute top-0 left-0 w-full bg-black bg-opacity-60 p-4 text-center font-semibold text-lg text-white">
            <h1 className="font-bold text-2xl">{`${props.year}/${props.month}/${props.day}のお題「${props.targetThemes[0].title}」`}</h1>
            <h2 className="text-xl">{`作品数: ${props.worksCount}`}</h2>
          </div>
        </div>
      )}

      <Tabs
        defaultValue={tab}
        value={tab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger
            onClick={() => {
              setTab("list")
            }}
            value="list"
          >
            <div className="w-full">{"作品一覧"}</div>
          </TabsTrigger>
          <TabsTrigger
            onClick={() => {
              setTab("calender")
            }}
            value="calender"
          >
            <div className="w-full">{"カレンダー"}</div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="m-0 flex flex-col space-y-4">
          <Carousel
            className="relative overflow-hidden"
            opts={{ dragFree: true, loop: false }}
          >
            <CarouselContent>
              {props.dailyBeforeThemes.length > 0 &&
                props.dailyBeforeThemes.map((theme) => (
                  <CarouselItem className="basis-auto" key={theme.id}>
                    <TagButton
                      link={
                        props.isSensitive
                          ? `/sensitive/themes/${theme.year}/${theme.month}/${theme.day}`
                          : `/themes/${theme.year}/${theme.month}/${theme.day}`
                      }
                      name={theme.title}
                      isDisabled={
                        new Date(theme.year, theme.month - 1, theme.day) >
                        new Date()
                      }
                      title={`${theme.year}/${theme.month}/${theme.day}`}
                    />
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute top-1/2 left-0" />
            <CarouselNext className="absolute top-1/2 right-0" />
          </Carousel>
          {works && works.length > 0 && (
            <div className="mt-4">
              <ResponsivePhotoWorksAlbum works={works} />
            </div>
          )}
          <div className="h-8" />
          <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <ResponsivePagination
              maxCount={props.worksCount || 0}
              perPage={32}
              currentPage={props.page}
              onPageChange={(page: number) => {
                if (props.isSensitive) {
                  if (props.day) {
                    navigate(`/sensitive/themes/${props.year}/${props.month}/${props.day}?page=${page}`)
                  } else {
                    navigate(`/sensitive/themes?page=${page}`)
                  }
                } else {
                  if (props.day) {
                    navigate(`/themes/${props.year}/${props.month}/${props.day}?page=${page}`)
                  } else {
                    navigate(`/themes?page=${page}`)
                  }  
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
