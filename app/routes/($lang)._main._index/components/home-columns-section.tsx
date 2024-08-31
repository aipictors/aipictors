import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { LikeButton } from "~/components/like-button"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"
import { NovelWorkPreviewItem } from "~/routes/($lang)._main._index/components/video-work-preview-item"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"

type Props = {
  title: string
  isSensitive?: boolean
  works: FragmentOf<typeof HomeColumnPostFragment>[]
  dateText: string
}

/**
 * 小説作品一覧
 */
export function HomeColumnsSection(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: novelWorks } = useQuery(WorksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.novel,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        workType: "COLUMN",
        beforeCreatedAt: props.dateText,
      },
    },
  })

  const workDisplayed = novelWorks?.works ?? props.works

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title}
        </h2>
      </div>
      <CarouselWithGradation
        items={
          workDisplayed?.map((work, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className="h-full rounded border-2 border-gray border-solid"
            >
              <div className="relative">
                <NovelWorkPreviewItem
                  workId={work.id}
                  imageUrl={work.largeThumbnailImageURL}
                  title={work.title}
                  text={work.description ?? ""}
                  tags={[]}
                />
              </div>
              <UserNameBadge
                userId={work.user.id}
                userIconImageURL={ExchangeIconUrl(work.user.iconUrl)}
                name={work.user.name}
                width={"lg"}
                padding={"md"}
              />
              <div className="absolute right-0 bottom-0">
                <LikeButton
                  size={56}
                  targetWorkId={work.id}
                  targetWorkOwnerUserId={work.user.id}
                  defaultLiked={work.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
            </div>
          )) || []
        }
      />
    </section>
  )
}

/**
 * TODO_2024_09: 不要なフィールドを削除する
 */
export const HomeColumnPostFragment = graphql(
  `fragment HomeColumnPost on WorkNode @_unmask {
    id
    title
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

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeColumnPost
    }
  }`,
  [HomeColumnPostFragment],
)
