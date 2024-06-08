import { LikeButton } from "@/_components/like-button"
import { NovelWorkPreviewItem } from "@/_components/novel-work-preview-item"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/_components/ui/carousel"
import {} from "@/_components/ui/tooltip"
import { UserNameBadge } from "@/_components/user-name-badge"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { getRecommendedWorkIds } from "@/_utils/get-recommended-work-ids"
import { useQuery } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"

type Props = {
  title: string
}

/**
 * 小説作品一覧
 */
export const HomeNovelsSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  const [recommendedIds, setRecommendedIds] = useState<string[]>([])

  useEffect(() => {
    const fetchRecommendedIds = async () => {
      if (!authContext.isNotLoading) {
        const userId = authContext.userId ?? "-1"

        try {
          const ids = await getRecommendedWorkIds(
            userId,
            undefined,
            "novel",
            "G",
          )
          setRecommendedIds(ids)
        } catch (error) {
          console.error("Error fetching recommended work IDs:", error)
        }
      }
    }

    fetchRecommendedIds()
  }, [authContext.userId])

  const { data: novelWorks } = useQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 64,
      where: {
        ids: recommendedIds,
        ratings: ["G", "R15", "R18", "R18G"],
      },
    },
  })

  const workList = novelWorks?.works ?? null

  if (workList === null) {
    return null
  }

  const workResults = workList.map((work) => ({
    id: work.id,
    src: work.smallThumbnailImageURL,
    width: work.smallThumbnailImageWidth,
    height: work.smallThumbnailImageHeight,
    workId: work.id,
    thumbnailImagePosition: work.thumbnailImagePosition,
    userId: work.user.id,
    userIcon: work.user.iconImage?.downloadURL,
    userName: work.user.name,
    title: work.title,
    isLiked: work.isLiked,
    text: work.description,
    tags: work.tags.map((tag) => tag.name).slice(0, 2),
  }))

  // ランダムに24作品を選ぶ
  const works = workResults.filter((_, index) => index % 2 === 0)

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title}
        </h2>
        {/* <Button variant={"secondary"} size={"sm"}>
          {"すべて見る"}
        </Button> */}
      </div>

      <Carousel className="relative" opts={{ dragFree: true, loop: false }}>
        <CarouselContent>
          {works.map((work, index) => (
            <CarouselItem
              key={work.id}
              className="relative basis-1/3.5 space-y-2"
            >
              <div className="relative">
                <NovelWorkPreviewItem
                  workId={work.id}
                  imageUrl={work.src}
                  title={work.title}
                  text={work.text ?? ""}
                  tags={work.tags}
                />
              </div>
              <UserNameBadge
                userId={work.userId}
                userIconImageURL={work.userIcon}
                name={work.userName}
                width={"lg"}
              />
              <div className="absolute right-0 bottom-0">
                <LikeButton
                  size={56}
                  targetWorkId={work.id}
                  targetWorkOwnerUserId={work.userId}
                  defaultLiked={work.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
            </CarouselItem>
          ))}
          <CarouselItem className="relative w-16 basis-1/3.5 space-y-2" />
        </CarouselContent>
        <div className="absolute top-0 right-0 h-full w-16 bg-gradient-to-r from-transparent to-white dark:to-black" />
      </Carousel>
    </section>
  )
}
