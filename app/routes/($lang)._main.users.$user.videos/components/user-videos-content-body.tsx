import { UserTabs } from "~/routes/($lang)._main.users.$user._index/components/user-tabs"
import { type FragmentOf, graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { UserVideosContents } from "~/routes/($lang)._main.users.$user.videos/components/user-videos-contents"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  videos: FragmentOf<typeof UserVideosItemFragment>[]
  page: number
  maxCount: number
}

export function UserVideosContentBody(props: Props) {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const { data: videosWorks } = useQuery(UserVideosQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: props.user.id,
        ratings: ["G", "R15"],
        workType: "VIDEO",
        isNowCreatedAt: true,
      },
    },
  })

  const videos = videosWorks?.works ?? props.videos

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <UserTabs activeTab={t("動画", "Videos")} user={props.user} />
      <div className="flex min-h-96 flex-col gap-y-4">
        <section className="relative space-y-4">
          <UserVideosContents videos={videos} />
        </section>
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(`/users/${props.user.login}/videos?page=${page}`)
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
