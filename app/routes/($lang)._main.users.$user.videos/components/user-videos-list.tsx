import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { ResponsivePhotoVideoWorksAlbum } from "~/components/responsive-photo-video-works-album"
import {
  type UserWorksSort,
  UserWorksTabLayout,
} from "~/components/user-works/user-works-tab-layout"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  works: FragmentOf<typeof UserVideosItemFragment>[]
  page: number
  maxCount: number
  sort: UserWorksSort
  login: string
}

/**
 * ユーザーページの「動画」タブ
 */
export function UserVideoList(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const userId = props.works[0]?.user?.id ?? ""

  // いいね済みかどうかは見ている人で変わるので、ログイン中だけ取り直す
  const { data } = useQuery(UserVideosQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn || userId === "",
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId,
        ratings: ["G", "R15"],
        workType: "VIDEO",
        isNowCreatedAt: true,
        ...(props.sort === "popular"
          ? { orderBy: "LIKES_COUNT" as const, sort: "DESC" as const }
          : {}),
      },
    },
  })

  const works = data?.works ?? props.works

  return (
    <UserWorksTabLayout
      title={t("動画", "Videos")}
      count={props.maxCount}
      basePath={`/users/${encodeURIComponent(props.login)}/videos`}
      page={props.page}
      perPage={32}
      sort={props.sort}
    >
      <ResponsivePhotoVideoWorksAlbum isAutoPlay={true} works={works} />
    </UserWorksTabLayout>
  )
}

export const UserVideosItemFragment = graphql(
  `fragment UserVideosItem on WorkNode @_unmask {
    id
    title
    url
    streamUid
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
