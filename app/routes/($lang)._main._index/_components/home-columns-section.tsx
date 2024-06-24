import { CarouselWithGradation } from "@/_components/carousel-with-gradation"
import { IconUrl } from "@/_components/icon-url"
import { LikeButton } from "@/_components/like-button"
import { NovelWorkPreviewItem } from "@/_components/novel-work-preview-item"
import { UserNameBadge } from "@/_components/user-name-badge"
import { AuthContext } from "@/_contexts/auth-context"
import { worksQuery } from "@/_graphql/queries/work/works"
import { getRecommendedWorkIds } from "@/_utils/get-recommended-work-ids"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"

type Props = {
  title: string
  isSensitive?: boolean
}

/**
 * 小説作品一覧
 */
export const HomeColumnsSection = (props: Props) => {
  const authContext = useContext(AuthContext)

  const [recommendedIds, setRecommendedIds] = useState<string[]>([])

  useEffect(() => {
    const fetchRecommendedIds = async () => {
      const userId = authContext.userId ?? "-1"

      try {
        const ids = await getRecommendedWorkIds(
          userId,
          undefined,
          "column",
          props.isSensitive ? "R18" : "G",
        )
        setRecommendedIds(ids)
      } catch (error) {
        console.error("Error fetching recommended work IDs:", error)
      }
    }

    fetchRecommendedIds()
  }, [authContext.userId])

  const { data: novelWorks } = useSuspenseQuery(worksQuery, {
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

  const workResults = workList?.map((work) => ({
    id: work.id,
    src: work.smallThumbnailImageURL,
    width: work.smallThumbnailImageWidth,
    height: work.smallThumbnailImageHeight,
    workId: work.id,
    thumbnailImagePosition: work.thumbnailImagePosition,
    userId: work.user.id,
    userIcon: work.user.iconUrl,
    userName: work.user.name,
    title: work.title,
    isLiked: work.isLiked,
    text: work.description,
    tags: work.tags.map((tag) => tag.name).slice(0, 2),
  }))

  // ランダムに24作品を選ぶ
  const works = workResults?.filter((_, index) => index % 2 === 0)

  return (
    <section className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="items-center space-x-2 font-bold text-md">
          {props.title}
        </h2>
      </div>
      <CarouselWithGradation
        items={
          works?.map((work, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
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
                userIconImageURL={IconUrl(work.userIcon)}
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
            </div>
          )) || []
        }
      />
    </section>
  )
}
