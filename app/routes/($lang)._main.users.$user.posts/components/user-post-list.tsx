import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import {
  type PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import {
  type UserWorksSort,
  UserWorksTabLayout,
} from "~/components/user-works/user-works-tab-layout"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  works: FragmentOf<typeof UserPostsItemFragment>[]
  page: number
  maxCount: number
  sort: UserWorksSort
  login: string
}

/**
 * ユーザーページの「画像」タブ
 */
export function UserPostList(props: Props) {
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const userId = props.works[0]?.user?.id ?? ""

  // いいね済みかどうかは見ている人で変わるので、ログイン中だけ取り直す
  const { data } = useQuery(UserPostsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn || userId === "",
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId,
        ratings: ["G", "R15"],
        workType: "WORK",
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
      title={t("画像", "Images")}
      count={props.maxCount}
      basePath={`/users/${encodeURIComponent(props.login)}/posts`}
      page={props.page}
      perPage={32}
      sort={props.sort}
    >
      <ResponsivePhotoWorksAlbum
        works={works as unknown as FragmentOf<typeof PhotoAlbumWorkFragment>[]}
        isShowProfile={false}
      />
    </UserWorksTabLayout>
  )
}

export const UserPostsItemFragment = graphql(
  `fragment UserPostsItem on WorkNode @_unmask {
    id
    title
    enTitle
    enDescription
    accessType
    adminAccessType
    type
    likesCount
    commentsCount
    bookmarksCount
    viewsCount
    createdAt
    rating
    isTagEditable
    smallThumbnailImageURL
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    largeThumbnailImageURL
    largeThumbnailImageHeight
    largeThumbnailImageWidth
    type
    isLiked
    thumbnailImagePosition
    description
    url
    subWorksCount
    tags {
      name
    }
    user {
      login
      id
      name
      iconUrl
    }
    uuid
  }`,
)

export const UserPostsQuery = graphql(
  `query UserPosts($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...UserPostsItem
    }
    worksCount(where: $where)
  }`,
  [UserPostsItemFragment],
)
