// LikeButton は CroppedWorkSquare 内部での表示に統合されたため未使用

import { Link } from "~/lib/app/locale-router"
import { type FragmentOf, graphql } from "gql.tada"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { useLayoutVariant } from "~/hooks/use-layout-variant"
import { useTranslation } from "~/hooks/use-translation"
import { UserNameBadge } from "~/routes/($lang)._main._index/components/user-name-badge"
import { cn } from "~/lib/utils"
import {
  type GridColumnBreakpoint,
  incompleteRowHiddenClassName,
} from "~/utils/grid-layout"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

/** PC: md:3 / lg:4 / xl:5 / 2xl:6 列 */
const DESKTOP_BREAKPOINTS: GridColumnBreakpoint[] = [
  { columns: 3, hiddenClassName: "md:max-lg:hidden" },
  { columns: 4, hiddenClassName: "lg:max-xl:hidden" },
  { columns: 5, hiddenClassName: "xl:max-2xl:hidden" },
  { columns: 6, hiddenClassName: "2xl:hidden" },
]

/** スマホ: 2 列（スマホ用の一覧は PC では出ないので常に隠してよい） */
const MOBILE_BREAKPOINTS: GridColumnBreakpoint[] = [
  { columns: 2, hiddenClassName: "hidden" },
]

type Props = {
  works: FragmentOf<typeof HomeCoppedWorkFragment>[]
  isRanking?: boolean
  isShowProfile?: boolean
  autoPlayVideoPreview?: boolean
  onSelect?: (index: string) => void
  /** 最後の行の半端な作品を隠して行をぴったり埋める */
  fillRows?: boolean
}

/**
 * クロップ済み作品一覧
 */
export function HomeCroppedWorkList(props: Props) {
  const t = useTranslation()
  const { showDesktop, showMobile } = useLayoutVariant()

  if (!props.works || props.works.length === 0) {
    return null
  }

  const works = props.works.filter(
    (work, index, self) => self.findIndex((w) => w.id === work.id) === index,
  )

  const fillRowsClassName = (
    index: number,
    breakpoints: GridColumnBreakpoint[],
  ) =>
    props.fillRows
      ? incompleteRowHiddenClassName(index, works.length, breakpoints)
      : undefined

  return (
    <>
      {showDesktop && (
        <section className="hidden grid-cols-2 gap-3 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {works.map((work, index) => {
            const renderContent = (isInsideInteractive: boolean) => (
              <CroppedWorkSquare
                title={t.workTitle(work.title, work.enTitle)}
                isInsideInteractive={isInsideInteractive}
                workId={work.id}
                imageUrl={work.smallThumbnailImageURL}
                videoUrl={work.url}
                streamUid={work.streamUid}
                isAutoPlay={props.autoPlayVideoPreview}
                thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                size="lg"
                imageWidth={work.smallThumbnailImageWidth}
                imageHeight={work.smallThumbnailImageHeight}
                subWorksCount={work.subWorksCount}
                commentsCount={work.commentsCount}
                isPromptPublic={false}
                hasVideoUrl={Boolean(work.url || work.streamUid)}
                isGeneration={false}
                hasReferenceButton={false}
              />
            )

            return (
              <div
                className={cn(
                  "flex min-w-0 flex-col space-y-2",
                  fillRowsClassName(index, DESKTOP_BREAKPOINTS),
                )}
                key={work.id}
              >
                {props.onSelect ? (
                  <button
                    type="button"
                    onClick={() => props.onSelect?.(work.id)}
                    className="group relative w-full overflow-hidden rounded-md border-none bg-transparent p-0"
                  >
                    <div className="w-full">{renderContent(false)}</div>
                  </button>
                ) : (
                  <Link
                    to={`/posts/${work.id}`}
                    className="group relative block w-full overflow-hidden rounded-md"
                  >
                    <div className="w-full">{renderContent(true)}</div>
                  </Link>
                )}
                <p className="overflow-hidden text-ellipsis text-nowrap font-bold text-md">
                  {t.workTitle(work.title, work.enTitle)}
                </p>
                {work.user && (
                  <UserNameBadge
                    userId={work.user.id}
                    userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                    name={work.user.name}
                    width={"sm"}
                    likesCount={work.likesCount}
                  />
                )}
              </div>
            )
          })}
        </section>
      )}
      {showMobile && (
        <section className="grid grid-cols-2 gap-2 md:hidden md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {works.map((work, index) => (
            <div
              key={work.id}
              className={cn(
                "relative",
                fillRowsClassName(index, MOBILE_BREAKPOINTS),
              )}
            >
              <Link
                to={`/posts/${work.id}`}
                className="relative overflow-hidden"
              >
                <CroppedWorkSquare
                  title={t.workTitle(work.title, work.enTitle)}
                  isInsideInteractive={true}
                  workId={work.id}
                  imageUrl={work.smallThumbnailImageURL}
                  videoUrl={work.url}
                  streamUid={work.streamUid}
                  isAutoPlay={props.autoPlayVideoPreview}
                  thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
                  size="lg"
                  imageWidth={work.smallThumbnailImageWidth}
                  imageHeight={work.smallThumbnailImageHeight}
                  subWorksCount={work.subWorksCount}
                  commentsCount={work.commentsCount}
                  isPromptPublic={false}
                  hasVideoUrl={Boolean(work.url || work.streamUid)}
                  isGeneration={false}
                  hasReferenceButton={false}
                />
              </Link>
              {work.user && props.isShowProfile && (
                <>
                  <p className="overflow-hidden text-ellipsis text-nowrap font-bold text-md">
                    {t.workTitle(work.title, work.enTitle)}
                  </p>
                  <UserNameBadge
                    userId={work.user.id}
                    userIconImageURL={withIconUrlFallback(work.user.iconUrl)}
                    name={work.user.name}
                    width={"sm"}
                    likesCount={work.likesCount}
                  />
                </>
              )}
            </div>
          ))}
        </section>
      )}
    </>
  )
}

const HomeCoppedWorkFragment = graphql(
  `fragment HomeCoppedWork on WorkNode @_unmask {
    id
    title
    enTitle
    likesCount
    isLiked
    smallThumbnailImageURL
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    largeThumbnailImageURL
    largeThumbnailImageHeight
    largeThumbnailImageWidth
    thumbnailImagePosition
    url
    streamUid
    subWorksCount
    commentsCount
    user {
      id
      name
      iconUrl
    }
  }`,
)
