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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel"

type Props = {
  title: string
  awards: FragmentOf<typeof HomeWorkAwardFragment>[]
  awardDateText: string
}

/**
 * ランキング作品一覧
 */
export function HomeSensitiveAwardWorkSection(props: Props) {
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
        isSensitive: true,
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
        <h2 className="items-center space-x-2 font-bold text-xl">
          {props.title}
        </h2>
        {/* 昨日の日付 // /2024/05/01 */}
        <Link to={`rankings/${yesterdayStr}`}>
          <Button variant={"secondary"} size={"sm"}>
            {t("すべて見る", "All")}
          </Button>
        </Link>
      </div>
      <Carousel opts={{ dragFree: true, loop: false }}>
        <CarouselContent>
          {workDisplayed.map((work, index) => (
            <CarouselItem
              key={`carousel-${index.toString()}`}
              className="relative basis-1/3.5 space-y-2"
            >
              <div key={index.toString()} className="flex flex-col space-y-2">
                <div className="relative">
                  {work.work?.id &&
                    work.work?.smallThumbnailImageURL &&
                    work.work?.smallThumbnailImageWidth &&
                    work.work?.smallThumbnailImageHeight && (
                      <CroppedWorkSquare
                        workId={work.work.id}
                        imageUrl={work.work.smallThumbnailImageURL}
                        subWorksCount={work.work.subWorksCount}
                        thumbnailImagePosition={
                          work.work.thumbnailImagePosition ?? 0
                        }
                        size="lg"
                        imageWidth={work.work.smallThumbnailImageWidth}
                        imageHeight={work.work.smallThumbnailImageHeight}
                        ranking={index + 1}
                      />
                    )}
                  {work.work?.id && work.work.user?.id && (
                    <div className="absolute right-0 bottom-0">
                      <LikeButton
                        size={56}
                        targetWorkId={work.work.id}
                        targetWorkOwnerUserId={work.work.user.id}
                        defaultLiked={work.work.isLiked}
                        defaultLikedCount={0}
                        isBackgroundNone={true}
                        strokeWidth={2}
                        isParticle={true}
                      />
                    </div>
                  )}
                </div>
                <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-md">
                  {work.work?.title}
                </p>
                <div className="flex max-w-40 items-center justify-between">
                  {work.work?.user?.id && work.work.user.name && (
                    <UserNameBadge
                      userId={work.work.user.id}
                      userIconImageURL={withIconUrlFallback(
                        work.work.user.iconUrl,
                      )}
                      name={work.work.user.name}
                      width={"md"}
                    />
                  )}
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center space-x-1">
                      <Heart className="size-3 fill-gray-400 text-gray-400" />
                      <span className="text-xs">{work.work?.likesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
          <CarouselItem className="relative w-16 basis-1/3.5 space-y-2" />
          {/* <div className="relative basis-1/3.5 space-y-2" /> */}
        </CarouselContent>
        {/* <div className="absolute top-0 left-0 h-full w-16 bg-linear-to-r from-card to-transparent" /> */}
        <CarouselPrevious className="absolute left-0" />
        {/* <div className="absolute top-0 right-0 h-full w-16 bg-linear-to-r from-transparent to-card" /> */}
        <CarouselNext className="absolute right-0" />
      </Carousel>
    </section>
  )
}

export const HomeWorkAwardFragment = graphql(
  `fragment HomeWorkAward on WorkAwardNode @_unmask {
      id
      work {
        id
        title
        likesCount
        isLiked
        smallThumbnailImageURL
        smallThumbnailImageHeight
        smallThumbnailImageWidth
        thumbnailImagePosition
        subWorksCount
        user {
          id
          name
          iconUrl
        }
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
