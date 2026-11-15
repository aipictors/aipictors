import { Link } from "~/lib/app/locale-router"
import { isR18Work } from "~/lib/is-r18-work"
import type { FragmentOf } from "gql.tada"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { useLayoutVariant } from "~/hooks/use-layout-variant"
import { useTranslation } from "~/hooks/use-translation"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { cn } from "~/lib/utils"
import {
  splitMasonryColumns,
  toMasonryAspectRatio,
} from "~/utils/split-masonry-columns"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  isRanking?: boolean
  isShowProfile?: boolean
  hasReferenceButton?: boolean
  onSelect?: (index: string) => void
  shouldMaskSensitiveWorks?: boolean
  /** 先頭から何件の画像を優先して読み込むか（LCP 対策） */
  priorityCount?: number
  /**
   * スマホ用の一覧だけを出す（親が md:hidden のとき。PC 用の一覧は見えないのに DOM・画像の読み込み・hydration の負担になる）
   */
  isMobileOnly?: boolean
  /** スマホでアプリと同じ石垣状に並べる（正方形に切り抜かない） */
  isMasonry?: boolean
}

const isSensitiveWork = (work: FragmentOf<typeof PhotoAlbumWorkFragment>) =>
  isR18Work(work)

/**
 * クロップ済み作品一覧
 */
export function HomeCroppedWorks(props: Props) {
  const t = useTranslation()
  const { showDesktop, showMobile } = useLayoutVariant()

  if (!props.works || props.works.length === 0) {
    return null
  }

  const uniqueWorks = props.works.filter(
    (work, index, self) => self.findIndex((w) => w.id === work.id) === index,
  )

  const renderMobileItem = (
    work: FragmentOf<typeof PhotoAlbumWorkFragment>,
    index: number,
    aspectRatio?: number,
  ) => {
    const square = (
      <CroppedWorkSquare
        isInsideInteractive={true}
        isPriority={index < (props.priorityCount ?? 0)}
        isLowPriority={
          props.priorityCount !== undefined && index >= props.priorityCount
        }
        media={props.isMobileOnly ? "(max-width: 767.98px)" : undefined}
        title={t.workTitle(work.title, work.enTitle)}
        workId={work.id}
        imageUrl={work.smallThumbnailImageURL}
        thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
        size="auto"
        aspectRatio={aspectRatio}
        imageWidth={work.smallThumbnailImageWidth}
        imageHeight={work.smallThumbnailImageHeight}
        subWorksCount={work.subWorksCount}
        commentsCount={work.commentsCount}
        isPromptPublic={work.promptAccessType === "PUBLIC"}
        hasVideoUrl={Boolean(work.url)}
        isGeneration={work.isGeneration}
        hasReferenceButton={props.hasReferenceButton}
        shouldMaskSensitive={
          props.shouldMaskSensitiveWorks === true && isSensitiveWork(work)
        }
      />
    )
    const likeButton = (
      <div className="absolute right-2 bottom-2 z-10">
        <LikeButton
          size={56}
          targetWorkId={work.id}
          targetWorkOwnerUserId={work.user?.id ?? ""}
          defaultLiked={work.isLiked}
          defaultLikedCount={0}
          isBackgroundNone={true}
          strokeWidth={2}
          isParticle={true}
        />
      </div>
    )
    return (
      <div key={work.id} className="relative w-full">
        {props.onSelect ? (
          <button
            type="button"
            onClick={() => props.onSelect?.(work.id)}
            className={cn(
              "group relative block w-full overflow-hidden border-none bg-transparent p-0",
              aspectRatio !== undefined ? "rounded-[14px]" : "rounded-xl",
            )}
          >
            {square}
            {likeButton}
          </button>
        ) : (
          <Link to={`/posts/${work.id}`} className="relative block">
            {square}
            {likeButton}
          </Link>
        )}
        {work.user && props.isShowProfile && (
          <>
            <p className="mt-1.5 overflow-hidden text-ellipsis text-nowrap px-0.5 font-bold text-sm">
              {t.workTitle(work.title, work.enTitle)}
            </p>
            <UserNameBadge
              userId={work.user.id}
              frame={work.user.avatarFrame}
              userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
              name={work.user.name}
              width={"md"}
              likesCount={work.likesCount}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <>
      {!props.isMobileOnly && showDesktop && (
        <section className="hidden grid-cols-2 gap-4 md:grid md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {props.works
            .filter(
              (work, index, self) =>
                self.findIndex((w) => w.id === work.id) === index,
            )
            .map((work, index) => (
              <div className="flex flex-col space-y-2" key={work.id}>
                <Link to={`/posts/${work.id}`} className="group relative">
                  <CroppedWorkSquare
                    isPriority={index < (props.priorityCount ?? 0)}
                    isLowPriority={
                      props.priorityCount !== undefined &&
                      index >= props.priorityCount
                    }
                    title={t.workTitle(work.title, work.enTitle)}
                    isInsideInteractive={true}
                    workId={work.id}
                    imageUrl={work.smallThumbnailImageURL}
                    thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                    size="lg"
                    imageWidth={work.smallThumbnailImageWidth}
                    imageHeight={work.smallThumbnailImageHeight}
                    subWorksCount={work.subWorksCount}
                    commentsCount={work.commentsCount}
                    isPromptPublic={work.promptAccessType === "PUBLIC"}
                    hasVideoUrl={Boolean(work.url)}
                    isGeneration={work.isGeneration}
                    hasReferenceButton={props.hasReferenceButton}
                    shouldMaskSensitive={
                      props.shouldMaskSensitiveWorks === true &&
                      isSensitiveWork(work)
                    }
                  />
                  <div className="absolute right-2 bottom-2 z-10">
                    <LikeButton
                      size={56}
                      targetWorkId={work.id}
                      targetWorkOwnerUserId={work.user?.id ?? ""}
                      defaultLiked={work.isLiked}
                      defaultLikedCount={0}
                      isBackgroundNone={true}
                      strokeWidth={2}
                      isParticle={true}
                    />
                  </div>
                </Link>
                <p className="max-w-40 overflow-hidden text-ellipsis text-nowrap font-bold text-md">
                  {t.workTitle(work.title, work.enTitle)}
                </p>
                {work.user && (
                  <UserNameBadge
                    userId={work.user.id}
                    frame={work.user.avatarFrame}
                    userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                    name={work.user.name}
                    width={"lg"}
                    likesCount={work.likesCount}
                  />
                )}
              </div>
            ))}
        </section>
      )}
      {showMobile &&
        (props.isMasonry ? (
          // アプリと同じ石垣状（縦横比をそのまま、いちばん短い列に足す）
          <section className="grid grid-cols-2 items-start gap-x-2.5 md:hidden">
            {splitMasonryColumns(
              uniqueWorks,
              2,
              (work) =>
                toMasonryAspectRatio(
                  work.smallThumbnailImageWidth,
                  work.smallThumbnailImageHeight,
                ),
              props.isShowProfile ? 0.28 : 0,
            ).map((column, columnIndex) => (
              <div
                // 列は 2 つで固定
                // biome-ignore lint/suspicious/noArrayIndexKey: 列の位置そのものが key
                key={columnIndex}
                className="flex min-w-0 flex-col gap-y-3.5"
              >
                {column.map(({ item, index }) =>
                  renderMobileItem(
                    item,
                    index,
                    toMasonryAspectRatio(
                      item.smallThumbnailImageWidth,
                      item.smallThumbnailImageHeight,
                    ),
                  ),
                )}
              </div>
            ))}
          </section>
        ) : (
          <section className="safari-work-grid grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 md:hidden">
            {uniqueWorks.map((work, index) => renderMobileItem(work, index))}
          </section>
        ))}
    </>
  )
}
