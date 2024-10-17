import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { Heart } from "lucide-react"
import { config } from "~/config"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  title: string
  awards: FragmentOf<typeof HomeWorkAwardFragment>[]
  awardDateText: string
}

/**
 * ランキング作品一覧
 */
export function HomeAwardWorkSection(props: Props) {
  const authContext = useContext(AuthContext)

  const year = props.awardDateText.split("/")[0]
  const month = props.awardDateText.split("/")[1]
  const day = props.awardDateText.split("/")[2]

  // ランキング
  // 前日のランキングを取得
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const { data: workAwardsResp } = useQuery(WorkAwardsQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.award,
      where: {
        year: Number(year),
        month: Number(month),
        day: Number(day),
        isSensitive: false,
      },
    },
  })

  const workDisplayed = workAwardsResp?.workAwards ?? props.awards

  const yesterdayStr = `${yesterday.getFullYear()}/${
    yesterday.getMonth() + 1
  }/${yesterday.getDate()}`

  const t = useTranslation()

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title}
        </h2>
        {/* 昨日の日付 // /2024/05/01 */}
        <Link to={`rankings/${yesterdayStr}`}>
          <Button variant={"secondary"} size={"sm"}>
            {t("すべて見る", "All")}
          </Button>
        </Link>
      </div>
      <CarouselWithGradation
        items={workDisplayed
          .filter((work) => work.work !== null)
          .map((work) => ({
            id: work.work?.id,
            src: work.work?.smallThumbnailImageURL,
            width: work.work?.smallThumbnailImageWidth,
            height: work.work?.smallThumbnailImageHeight,
            workId: work.work?.id,
            thumbnailImagePosition: work.work?.thumbnailImagePosition,
            userId: work.work?.user.id,
            userIcon: work.work?.user.iconUrl,
            userName: work.work?.user.name,
            title: work.work?.title,
            isLiked: work.work?.isLiked,
            subWorksCount: work.work?.subWorksCount,
            likesCount: work.work?.likesCount,
          }))
          .map((work, index) => (
            <div key={index.toString()} className="flex flex-col space-y-2">
              <div className="relative">
                {work.workId && work.src && work.width && work.height && (
                  <CroppedWorkSquare
                    workId={work.workId}
                    imageUrl={work.src}
                    subWorksCount={work.subWorksCount}
                    thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                    size="lg"
                    imageWidth={work.width}
                    imageHeight={work.height}
                    ranking={index + 1}
                  />
                )}
                {work.workId && work.userId && (
                  <div className="absolute right-0 bottom-0">
                    <LikeButton
                      size={56}
                      targetWorkId={work.workId}
                      targetWorkOwnerUserId={work.userId}
                      defaultLiked={work.isLiked}
                      defaultLikedCount={0}
                      isBackgroundNone={true}
                      strokeWidth={2}
                      isParticle={true}
                    />
                  </div>
                )}
              </div>
              <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-md">
                {work.title}
              </p>
              <div className="flex max-w-40 items-center justify-between">
                {work.userId && work.userName && (
                  <UserNameBadge
                    userId={work.userId}
                    userIconImageURL={withIconUrlFallback(work.userIcon)}
                    name={work.userName}
                    width={"md"}
                  />
                )}
                <div className="flex items-center space-x-1">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3 fill-gray-400 text-gray-400" />
                    <span className="text-xs">{work.likesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      />
    </section>
  )
}

/**
 * TODO_2024_09: 不要なフィールドを削除する
 */
export const HomeWorkAwardFragment = graphql(
  `fragment HomeWorkAward on WorkAwardNode @_unmask {
      id
      index
      dateText
      work {
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
      }
  }`,
)

const WorkAwardsQuery = graphql(
  `query WorkAwards($offset: Int!, $limit: Int!, $where: WorkAwardsWhereInput!) {
    workAwards(offset: $offset, limit: $limit, where: $where) {
      id
      ...HomeWorkAward
    }
  }`,
  [HomeWorkAwardFragment],
)
