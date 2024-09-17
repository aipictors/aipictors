import { Link, useNavigate } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { useQuery } from "@apollo/client/index"
import { useContext, useState } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { AuthContext } from "~/contexts/auth-context"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { Minus, Plus } from "lucide-react"
import {
  ThemeList,
  type ThemeListItemFragment,
} from "~/routes/($lang)._main.themes._index/components/theme-list"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"

type Props = {
  works: FragmentOf<typeof ThemeWorkFragment>[]
  worksCount: number
  firstWork: FragmentOf<typeof ThemeWorkFragment> | null
  isSensitive: boolean
  title: string
  year: number
  month: number
  day: number
  page: number
  themeId: string
  dailyThemes: FragmentOf<typeof ThemeListItemFragment>[]
  dailyBeforeThemes: FragmentOf<typeof ThemeListItemFragment>[]
}

export function ThemeArticle(props: Props) {
  const navigate = useNavigate()

  const [isOpenedCalender, setIsOpenedCalender] = useState(false)

  const authContext = useContext(AuthContext)

  const { data: resp } = useQuery(themeWorksQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        subjectId: Number(props.themeId),
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        orderBy: "LIKES_COUNT",
        isNowCreatedAt: true,
      },
    },
  })

  const onToggleCalender = () => {
    setIsOpenedCalender((prev) => !prev)
  }

  const works = resp?.works ?? props.works

  return (
    <div className="flex flex-col space-y-6 rounded-lg bg-gradient-to-b p-4">
      <Button
        onClick={() => {
          navigate("/themes")
        }}
        variant={"secondary"}
        size={"sm"}
        className="h-8 w-full"
      >
        {"お題トップ"}
      </Button>
      <div className="relative h-48 overflow-hidden rounded-md ">
        <img
          src={props.firstWork?.smallThumbnailImageURL ?? ""}
          alt={props.firstWork?.title ?? ""}
          className="absolute top-0 left-0 z-0 m-auto blur-[240px]"
        />
        <img
          src={props.firstWork?.smallThumbnailImageURL ?? ""}
          alt={props.firstWork?.title ?? ""}
          className="absolute top-0 left-0 m-auto object-contain"
        />
        <div className="absolute top-0 left-0 bg-black bg-opacity-60 p-4 font-semibold text-lg text-white">
          <h1 className="font-bold text-2xl">{props.title}</h1>
          {props.isSensitive && <h2 className="text-md">{"センシティブ"}</h2>}
          <h2 className="text-xl">{`作品数: ${props.worksCount}`}</h2>
          <p className="text-sm opacity-80">作品は1日ごとに集計されます</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={onToggleCalender}
          className="h-8 w-full"
          aria-label="Toggle Calender"
          variant={"secondary"}
        >
          {isOpenedCalender ? <Minus /> : <Plus />}
          {isOpenedCalender ? "カレンダーを閉じる" : "カレンダーを開く"}
        </Button>
      </div>
      {isOpenedCalender && (
        <ThemeList
          year={props.year}
          month={props.month}
          dailyThemes={props.dailyThemes}
        />
      )}
      <Carousel
        className="relative overflow-hidden"
        opts={{ dragFree: true, loop: false }}
      >
        <CarouselContent>
          {props.dailyBeforeThemes.length > 0 &&
            props.dailyBeforeThemes.map((theme) => (
              <CarouselItem key={theme.id} className="basis-1/3">
                <Card>
                  <CardContent className="m-0 h-full p-2">
                    <Link
                      className="block h-full"
                      to={
                        props.isSensitive
                          ? `/r/themes/${theme.year}/${theme.month}/${theme.day}`
                          : `/themes/${theme.year}/${theme.month}/${theme.day}`
                      }
                    >
                      <div className="flex h-full flex-col items-center space-y-2 text-center">
                        <p className="font-semibold text-sm">{`${theme.year}/${theme.month}/${theme.day}`}</p>
                        <p className="text-sm">{theme.title}</p>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-0" />
        <CarouselNext className="absolute top-1/2 right-0" />
      </Carousel>
      <Separator />
      <div className="mt-4">
        <ResponsivePhotoWorksAlbum works={works} />
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          maxCount={Number(props.worksCount)}
          perPage={32}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(
              `/themes/${props.year}/${props.month}/${props.day}?page=${page}`,
            )
          }}
        />
      </div>
    </div>
  )
}

export const ThemeWorkFragment = graphql(
  `fragment ThemeWork on WorkNode @_unmask {
    id
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)

export const themeWorksQuery = graphql(
  `query AlbumWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...ThemeWork
    }
  }`,
  [ThemeWorkFragment],
)
