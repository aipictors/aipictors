import { UserTabs } from "~/routes/($lang)._main.users.$user._index/components/user-tabs"
import { type FragmentOf, graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user._index/components/user-profile-name-icon"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  posts: FragmentOf<typeof UserPostsItemFragment>[]
  page: number
  maxCount: number
  isSensitive?: boolean
}

export function UserPostsContentBody(props: Props) {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const { data: postsWorks } = useQuery(UserPostsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: props.user.id,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        workType: "WORK",
        isNowCreatedAt: true,
      },
    },
  })

  const posts = postsWorks?.works ?? props.posts

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <UserTabs activeTab={t("画像", "Images")} user={props.user} />
      <div className="flex min-h-96 flex-col gap-y-4">
        <section className="relative space-y-4">
          <ResponsivePhotoWorksAlbum works={posts} isShowProfile={false} />
        </section>
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(`/users/${props.user.login}/posts?page=${page}`)
          }}
        />
      </div>
    </div>
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
    prompt
    negativePrompt
    isLiked
    thumbnailImagePosition
    description
    url
    subWorksCount
    tags {
      name
    }
    user {
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
