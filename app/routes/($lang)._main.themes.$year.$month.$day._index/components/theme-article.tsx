import { useNavigate } from "@remix-run/react"
import { graphql, type FragmentOf } from "gql.tada"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { AuthContext } from "~/contexts/auth-context"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { RefreshCcwIcon } from "lucide-react"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"

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
}

export function ThemeArticle(props: Props) {
  const navigate = useNavigate()

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
        isSensitive: props.isSensitive,
      },
    },
  })

  const works = resp?.works ?? props.works

  return (
    <div className="flex flex-col space-y-6 rounded-lg bg-gradient-to-b p-4">
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
        {!props.isSensitive ? (
          <AppConfirmDialog
            title={"確認"}
            description={
              "センシティブな作品を表示します、あなたは18歳以上ですか？"
            }
            onNext={() => {
              navigate(
                `/sensitive/themes/${props.year}/${props.month}/${props.day}`,
              )
            }}
            cookieKey={"check-sensitive-ranking"}
            onCancel={() => {}}
          >
            <Button
              variant={"secondary"}
              className="-translate-x-1/2 absolute bottom-1 left-1/2 flex w-32 transform cursor-pointer items-center"
            >
              <RefreshCcwIcon className="mr-1 w-3" />
              <p className="text-sm">{"対象年齢"}</p>
            </Button>
          </AppConfirmDialog>
        ) : (
          <Button
            onClick={() => {
              navigate(`/themes/${props.year}/${props.month}/${props.day}`)
            }}
            variant={"secondary"}
            className="-translate-x-1/2 absolute bottom-1 left-1/2 flex w-32 transform cursor-pointer items-center"
          >
            <RefreshCcwIcon className="mr-1 w-3" />
            <p className="text-sm">{"対象年齢"}</p>
          </Button>
        )}
      </div>
      <Button
        onClick={() => {
          navigate("/themes")
        }}
        variant={"secondary"}
        size={"sm"}
        className="w-full"
      >
        {"お題カレンダーに戻る"}
      </Button>
      <div className="mt-4">
        <ResponsivePhotoWorksAlbum works={works} />
      </div>
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
