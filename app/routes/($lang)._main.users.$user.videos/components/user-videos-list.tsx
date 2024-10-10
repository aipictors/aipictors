import { type FragmentOf, graphql } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ResponsivePhotoVideoWorksAlbum } from "~/components/responsive-photo-video-works-album"

type Props = {
  works: FragmentOf<typeof UserVideosItemFragment>[]
  page: number
  maxCount: number
}

export function UserVideoList(props: Props) {
  const authContext = useContext(AuthContext)

  const userId = props.works[0]?.user?.id ?? ""

  const userLogin = props.works[0]?.user?.login ?? ""

  const { data: videosWorks } = useQuery(UserVideosQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn || userId === "",
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: userId,
        ratings: ["G", "R15"],
        workType: "VIDEO",
        isNowCreatedAt: true,
      },
    },
  })

  const videos = videosWorks?.works ?? props.works

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex min-h-96 flex-col gap-y-4">
        <section className="relative space-y-4">
          <ResponsivePhotoVideoWorksAlbum
            isAutoPlay={true}
            works={props.works}
          />
        </section>
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(`/users/${userLogin}/videos?page=${page}`)
          }}
        />
      </div>
    </div>
  )
}

export const UserVideosItemFragment = graphql(
  `fragment UserVideosItem on WorkNode @_unmask {
    id
    title
    url
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    smallThumbnailImageURL
    likesCount
    isLiked
    user {
      login
      id
      name
      iconUrl
    }
  }`,
)

export const UserVideosQuery = graphql(
  `query UserVideos($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...UserVideosItem
    }
    worksCount(where: $where)
  }`,
  [UserVideosItemFragment],
)
