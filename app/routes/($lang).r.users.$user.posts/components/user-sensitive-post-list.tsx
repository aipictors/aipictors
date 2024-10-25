import { type FragmentOf, graphql } from "gql.tada"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"

type Props = {
  works: FragmentOf<typeof UserPostsItemFragment>[]
  page: number
  maxCount: number
}

export function UserSensitivePostList(props: Props) {
  const authContext = useContext(AuthContext)

  const userId = props.works[0]?.user.id ?? ""

  const userLogin = props.works[0]?.user.login ?? ""

  const { data: postsWorks } = useQuery(UserPostsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn || userId === "",
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: userId,
        ratings: ["R18", "R18G"],
        workType: "WORK",
        isNowCreatedAt: true,
      },
    },
  })

  const posts = postsWorks?.works ?? props.works

  const navigate = useNavigate()

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex min-h-96 flex-col gap-y-4">
        <section className="relative space-y-4">
          <ResponsivePhotoWorksAlbum works={posts} isShowProfile={true} />
        </section>
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={32}
          maxCount={props.maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(`/users/${userLogin}/posts?page=${page}`)
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
