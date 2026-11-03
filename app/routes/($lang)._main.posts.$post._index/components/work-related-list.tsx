/**
 * 作品の関連作品一覧
 */

import { Link } from "@remix-run/react"
import { ChevronRightIcon } from "lucide-react"
import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { Separator } from "~/components/ui/separator"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { useTranslation } from "~/hooks/use-translation"
import { WorkLazySection } from "~/routes/($lang)._main.posts.$post._index/components/work-lazy-section"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: {
    smallThumbnailImageURL: string
    thumbnailImagePosition: number
    smallThumbnailImageWidth: number
    smallThumbnailImageHeight: number
    id: string
    title?: string
    userId: string
    isLiked: boolean
    subWorksCount: number
    commentsCount: number
  }[]
}

/**
 * 直近の作品一覧
 */
export function WorkRelatedList(props: Props) {
  return (
    <div className="relative space-y-4">
      <CarouselWithGradation
        items={props.works.map((work) => (
          <div key={work.id} className="relative">
            <CroppedWorkSquare
              title={work.title}
              workId={work.id}
              subWorksCount={work.subWorksCount}
              imageUrl={work.smallThumbnailImageURL}
              thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
              size="md"
              imageWidth={work.smallThumbnailImageWidth}
              imageHeight={work.smallThumbnailImageHeight}
              commentsCount={work.commentsCount}
            />
            <div className="absolute right-0 bottom-0">
              <LikeButton
                size={32}
                targetWorkId={work.id}
                targetWorkOwnerUserId={work.userId}
                defaultLiked={work.isLiked}
                defaultLikedCount={0}
                isBackgroundNone={true}
                strokeWidth={2}
              />
            </div>
          </div>
        ))}
      />
      <Separator />
    </div>
  )
}

/**
 * 作者の他の作品。小さいサムネイルの横スクロールにしている（ユーザーの要望で、大きいグリッドには戻さない）
 */
export function WorkAuthorWorks(props: {
  works: Props["works"]
  currentWorkId: string
  header: React.ReactNode
}) {
  const works = props.works.filter((work) => work.id !== props.currentWorkId)

  if (works.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      {props.header}
      <WorkLazySection minHeightClassName="min-h-32">
        <CarouselWithGradation
          items={works.map((work) => (
            <div key={work.id} className="relative">
              <CroppedWorkSquare
                title={work.title}
                workId={work.id}
                subWorksCount={work.subWorksCount}
                imageUrl={work.smallThumbnailImageURL}
                thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                size="md"
                imageWidth={work.smallThumbnailImageWidth}
                imageHeight={work.smallThumbnailImageHeight}
                commentsCount={work.commentsCount}
              />
              <div className="absolute right-0 bottom-0">
                <LikeButton
                  size={32}
                  targetWorkId={work.id}
                  targetWorkOwnerUserId={work.userId}
                  defaultLiked={work.isLiked}
                  defaultLikedCount={0}
                  isBackgroundNone={true}
                  strokeWidth={2}
                />
              </div>
            </div>
          ))}
        />
      </WorkLazySection>
    </section>
  )
}

type AuthorWorksUser = {
  login: string
  name: string
  iconUrl?: string | null
  avatarFrame?: React.ComponentProps<typeof UserAvatarWithFrame>["frame"]
  works: (Omit<Props["works"][number], "thumbnailImagePosition" | "title"> & {
    thumbnailImagePosition?: number | null
    title?: string | null
  })[]
}

/**
 * 作品ページの「XXさんの作品」（見出しつき。全年齢と R18 で同じ）
 */
export function WorkAuthorWorksSection(props: {
  user: AuthorWorksUser
  currentWorkId: string
}) {
  const t = useTranslation()
  return (
    <WorkAuthorWorks
      currentWorkId={props.currentWorkId}
      works={props.user.works.map((work) => ({
        smallThumbnailImageURL: work.smallThumbnailImageURL,
        thumbnailImagePosition: work.thumbnailImagePosition ?? 0,
        smallThumbnailImageWidth: work.smallThumbnailImageWidth,
        smallThumbnailImageHeight: work.smallThumbnailImageHeight,
        id: work.id,
        title: work.title ?? undefined,
        userId: work.userId,
        isLiked: work.isLiked,
        subWorksCount: work.subWorksCount,
        commentsCount: work.commentsCount,
      }))}
      header={
        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/users/${props.user.login}`}
            className="flex min-w-0 items-center gap-2"
          >
            <UserAvatarWithFrame
              alt={props.user.name}
              frame={props.user.avatarFrame}
              isAnimated={false}
              sizeClassName="size-8 shrink-0"
              src={withIconUrlFallback(props.user.iconUrl)}
            />
            <h2 className="truncate font-bold text-base">
              {t(`${props.user.name} の作品`, `More from ${props.user.name}`)}
            </h2>
          </Link>
          <Link
            to={`/users/${props.user.login}/posts`}
            className="flex shrink-0 items-center text-muted-foreground text-sm hover:text-foreground"
          >
            {t("すべて見る", "See all")}
            <ChevronRightIcon className="size-4" />
          </Link>
        </div>
      }
    />
  )
}
