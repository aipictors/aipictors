import { CroppedWorkSquare } from "@/_components/cropped-work-square"
import { LikeButton } from "@/_components/like-button"
import { Button } from "@/_components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/_components/ui/carousel"
import {} from "@/_components/ui/tooltip"
import { UserNameBadge } from "@/_components/user-name-badge"
import { AuthContext } from "@/_contexts/auth-context"
import { workAwardsQuery } from "@/_graphql/queries/award/work-awards"
import { useQuery } from "@apollo/client/index"
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
      limit: 10,
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
    userIcon: work.work.user.iconImage?.downloadURL,
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
        <a href={`rankings/${yesterdayStr}`}>
          <Button variant={"secondary"} size={"sm"}>
            {"すべて見る"}
          </Button>
        </a>
      </div>

      <Carousel className="relative" opts={{ dragFree: true, loop: false }}>
        <CarouselContent>
          {works.map((work, index) => (
            <CarouselItem
              key={work.workId}
              className="relative basis-1/3.5 space-y-2"
            >
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
                userIconImageURL={work.userIcon}
                name={work.userName}
                width={"lg"}
              />
            </CarouselItem>
          ))}
          <CarouselItem className="relative w-16 basis-1/3.5 space-y-2" />
        </CarouselContent>
        <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-white dark:to-black" />
      </Carousel>
    </section>
  )
}
