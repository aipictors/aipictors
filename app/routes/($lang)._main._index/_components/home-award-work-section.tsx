import { CarouselWithGradation } from "@/_components/carousel-with-gradation"
import { CroppedWorkSquare } from "@/_components/cropped-work-square"
import { IconUrl } from "@/_components/icon-url"
import { LikeButton } from "@/_components/like-button"
import { Button } from "@/_components/ui/button"
import { UserNameBadge } from "@/_components/user-name-badge"
import { AuthContext } from "@/_contexts/auth-context"
import { workAwardsQuery } from "@/_graphql/queries/award/work-awards"
import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { useContext } from "react"

type Props = {
  title: string
  isSensitive?: boolean
}

/**
 * ランキング作品一覧
 */
export const HomeAwardWorkSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  // ランキング
  // 前日のランキングを取得
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const { data: workAwardsResp } = useQuery(workAwardsQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 20,
      where: {
        year: yesterday.getFullYear(),
        month: yesterday.getMonth() + 1,
        day: yesterday.getDate() - 1,
        isSensitive: props.isSensitive ?? false,
      },
    },
  })

  const workList = workAwardsResp?.workAwards ?? null

  if (workList === null) {
    return null
  }

  const works = workList.map((work) => ({
    id: work.work.id,
    src: work.work.smallThumbnailImageURL,
    width: work.work.smallThumbnailImageWidth,
    height: work.work.smallThumbnailImageHeight,
    workId: work.work.id,
    thumbnailImagePosition: work.work.thumbnailImagePosition,
    userId: work.work.user.id,
    userIcon: work.work.user.iconUrl,
    userName: work.work.user.name,
    title: work.work.title,
    isLiked: work.work.isLiked,
  }))

  const yesterdayStr = `${yesterday.getFullYear()}/${
    yesterday.getMonth() + 1
  }/${yesterday.getDate()}`

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title}
        </h2>
        {/* 昨日の日付 // /2024/05/01 */}
        <Link to={`rankings/${yesterdayStr}`}>
          <Button variant={"secondary"} size={"sm"}>
            {"すべて見る"}
          </Button>
        </Link>
      </div>

      <CarouselWithGradation
        items={works.map((work, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <div key={index}>
            <div className="relative">
              <CroppedWorkSquare
                workId={work.workId}
                imageUrl={work.src}
                thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                size="lg"
                imageWidth={work.width}
                imageHeight={work.height}
                ranking={index + 1}
              />
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
            </div>
            <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-xs">
              {work.title}
            </p>
            <UserNameBadge
              userId={work.userId}
              userIconImageURL={IconUrl(work.userIcon)}
              name={work.userName}
              width={"lg"}
            />
          </div>
        ))}
      />
    </section>
  )
}
