/**
 * 作品の関連作品一覧
 */

import { useApolloClient } from "@apollo/client/index"
import { Link } from "~/lib/app/locale-router"
import type { EmblaCarouselType } from "embla-carousel"
import { graphql } from "gql.tada"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  GalleryHorizontalIcon,
  LayoutGridIcon,
  Loader2Icon,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { Button } from "~/components/ui/button"
import type { CarouselApi } from "~/components/ui/carousel"
import { Separator } from "~/components/ui/separator"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { usePersistentState } from "~/hooks/use-persistent-state"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { useIsNearViewport } from "~/routes/($lang)._main.posts.$post._index/components/work-lazy-section"
import {
  type GridColumnBreakpoint,
  incompleteRowHiddenClassName,
} from "~/utils/grid-layout"
import { toIconImageUrl } from "~/utils/with-icon-url-fallback"

/** 作者の他の作品の一覧の列数: 3 / sm:4 / lg:5 */
const AUTHOR_GRID_BREAKPOINTS: GridColumnBreakpoint[] = [
  { columns: 3, hiddenClassName: "max-sm:hidden" },
  { columns: 4, hiddenClassName: "sm:max-lg:hidden" },
  { columns: 5, hiddenClassName: "lg:hidden" },
]

type Props = {
  works: {
    smallThumbnailImageURL: string
    thumbnailImagePosition: number
    smallThumbnailImageWidth: number
    smallThumbnailImageHeight: number
    id: string
    title?: string
    enTitle?: string | null
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
  const t = useTranslation()
  return (
    <div className="relative space-y-4">
      <CarouselWithGradation
        items={props.works.map((work) => (
          <div key={work.id} className="relative">
            <CroppedWorkSquare
              title={
                work.title ? t.workTitle(work.title, work.enTitle) : undefined
              }
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

/** 一度に読む作品数（最初に作品ページと一緒に読む数と同じ） */
const AUTHOR_WORKS_PAGE_SIZE = 16

/** 残りがこの枚数になったら次を読む（行き止まりに見えないように早めに） */
const AUTHOR_WORKS_LOAD_AHEAD = 8

/**
 * 作品を足しても今のスクロール位置と勢いを保つ（標準の処理だと近くの区切りに飛んで止まる）
 */
const keepScrollOnSlidesChange = (api: EmblaCarouselType) => {
  const reload = () => {
    const oldEngine = api.internalEngine()
    api.reInit()
    const newEngine = api.internalEngine()
    for (const key of [
      "scrollBody",
      "location",
      "offsetLocation",
      "previousLocation",
      "target",
    ] as const) {
      Object.assign(newEngine[key], oldEngine[key])
    }
    newEngine.translate.to(oldEngine.location.get())
    newEngine.index.set(newEngine.scrollTarget.byDistance(0, false).index)
    newEngine.animation.start()
  }

  const engine = api.internalEngine()
  if (!engine.dragHandler.pointerDown()) {
    reload()
    return
  }

  // ドラッグ中に作り直すと指についてこなくなるので、離してから
  engine.scrollBounds.toggleActive(engine.limit.reachedMax(engine.target.get()))
  const reloadAfterPointerUp = () => {
    api.off("pointerUp", reloadAfterPointerUp)
    reload()
  }
  api.on("pointerUp", reloadAfterPointerUp)
}

const authorWorksCarouselOptions = {
  dragFree: true,
  loop: false,
  watchSlides: keepScrollOnSlidesChange,
}

type AuthorWorksView = "carousel" | "grid"

/**
 * 横スクロールと一覧の切り替え（選んだ方を次の作品ページでも使う）
 */
function AuthorWorksViewToggle(props: {
  view: AuthorWorksView
  onChange: (view: AuthorWorksView) => void
}) {
  const t = useTranslation()
  const options = [
    {
      view: "carousel" as const,
      label: t("横スクロールで見る", "Scroll view"),
      icon: GalleryHorizontalIcon,
    },
    {
      view: "grid" as const,
      label: t("一覧で見る", "Grid view"),
      icon: LayoutGridIcon,
    },
  ]
  return (
    <div
      role="group"
      aria-label={t("表示の切り替え", "Change view")}
      className="flex shrink-0 items-center rounded-full bg-muted p-0.5"
    >
      {options.map((option) => {
        const isSelected = props.view === option.view
        return (
          <button
            key={option.view}
            type="button"
            aria-pressed={isSelected}
            aria-label={option.label}
            title={option.label}
            onClick={() => props.onChange(option.view)}
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-colors",
              isSelected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <option.icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

/**
 * 作者の他の作品。横スクロールは端に近づいたら続きを読み、一覧は「もっと見る」で続きを読む
 */
function WorkAuthorWorks(props: {
  works: Props["works"]
  currentWorkId: string
  userId: string
  ratings: AuthorWorksRating[]
  renderHeader: (viewToggle: React.ReactNode) => React.ReactNode
  seeAllTo: string
}) {
  const t = useTranslation()
  const client = useApolloClient()
  const [api, setApi] = useState<CarouselApi>()
  const [view, setView] = usePersistentState<AuthorWorksView>(
    "work-author-works-view",
    "grid",
  )
  const isGrid = view === "grid"
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(
    props.works.length >= AUTHOR_WORKS_PAGE_SIZE,
  )
  // 一覧はサーバーの HTML から出す（検索エンジンが作品同士のリンクをたどれるように）。
  // 続きの読み込みは、画面に近づいてから
  const sectionRef = useRef<HTMLElement>(null)
  const isNearViewport = useIsNearViewport(sectionRef)
  const [moreWorks, setMoreWorks] = useState<Props["works"]>([])

  const seenWorkIds = new Set<string>()
  const works = [...props.works, ...moreWorks].filter((work) => {
    if (work.id === props.currentWorkId || seenWorkIds.has(work.id)) {
      return false
    }
    seenWorkIds.add(work.id)
    return true
  })

  const pagingRef = useRef({
    offset: props.works.length,
    hasMore: props.works.length >= AUTHOR_WORKS_PAGE_SIZE,
    isLoading: false,
  })
  const loadedWorkIdsRef = useRef(new Set<string>())
  for (const work of props.works) {
    loadedWorkIdsRef.current.add(work.id)
  }

  const loadMore = useCallback(async () => {
    const paging = pagingRef.current
    if (!paging.hasMore || paging.isLoading) {
      return
    }
    paging.isLoading = true
    setIsLoading(true)
    try {
      const result = await client.query({
        query: authorMoreWorksQuery,
        fetchPolicy: "no-cache",
        variables: {
          userId: props.userId,
          offset: paging.offset,
          limit: AUTHOR_WORKS_PAGE_SIZE,
          where: { ratings: props.ratings },
        },
      })
      const fetched = result.data.user?.works ?? []
      const added = fetched.filter(
        (work) => !loadedWorkIdsRef.current.has(work.id),
      )
      for (const work of added) {
        loadedWorkIdsRef.current.add(work.id)
      }
      paging.offset += fetched.length
      // 読める上限の先は同じ作品が返るので、新しい作品がなければそこで終わり
      paging.hasMore =
        fetched.length >= AUTHOR_WORKS_PAGE_SIZE && added.length > 0
      if (added.length > 0) {
        setMoreWorks((current) => [
          ...current,
          ...added.map((work) => ({
            smallThumbnailImageURL: work.smallThumbnailImageURL,
            thumbnailImagePosition: work.thumbnailImagePosition ?? 0,
            smallThumbnailImageWidth: work.smallThumbnailImageWidth,
            smallThumbnailImageHeight: work.smallThumbnailImageHeight,
            id: work.id,
            title: work.title
              ? t.workTitle(work.title, work.enTitle)
              : undefined,
            userId: work.userId,
            isLiked: work.isLiked,
            subWorksCount: work.subWorksCount,
            commentsCount: work.commentsCount,
          })),
        ])
      }
    } catch {
      // 読めなければ今ある分だけ見せる
      paging.hasMore = false
    } finally {
      paging.isLoading = false
      setIsLoading(false)
      setHasMore(paging.hasMore)
    }
  }, [client, props.userId, props.ratings])

  useEffect(() => {
    if (!api || !isNearViewport || isGrid) {
      return
    }
    const loadMoreIfNearEnd = () => {
      const lastIndex = api.slideNodes().length - 1
      const lastInView = Math.max(-1, ...api.slidesInView())
      if (lastInView >= lastIndex - AUTHOR_WORKS_LOAD_AHEAD) {
        void loadMore()
      }
    }
    loadMoreIfNearEnd()
    api.on("slidesInView", loadMoreIfNearEnd)
    api.on("reInit", loadMoreIfNearEnd)
    return () => {
      api.off("slidesInView", loadMoreIfNearEnd)
      api.off("reInit", loadMoreIfNearEnd)
    }
  }, [api, loadMore, isNearViewport, isGrid])

  const changeView = (next: AuthorWorksView) => {
    if (next === "grid") {
      // 横スクロールの部品は消えるので、古い api に続きの読み込みをつながない
      setApi(undefined)
    }
    setView(next)
  }

  if (works.length === 0) {
    return null
  }

  const renderWork = (work: Props["works"][number], isAuto: boolean) => (
    <div key={work.id} className="relative">
      <CroppedWorkSquare
        title={work.title ? t.workTitle(work.title, work.enTitle) : undefined}
        workId={work.id}
        subWorksCount={work.subWorksCount}
        imageUrl={work.smallThumbnailImageURL}
        thumbnailImagePosition={work.thumbnailImagePosition ?? 0}
        size={isAuto ? "auto" : "md"}
        displayWidth={
          isAuto
            ? "(min-width: 1024px) 160px, (min-width: 640px) 25vw, 33vw"
            : undefined
        }
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
  )

  return (
    <section ref={sectionRef} className="space-y-3">
      {props.renderHeader(
        <AuthorWorksViewToggle view={view} onChange={changeView} />,
      )}
      {isGrid ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-5">
            {/* 最後の段に穴を空けない（埋まらない分はその幅でだけ隠す。残りは「もっと見る」・ユーザーページで見られる） */}
            {works.map((work, index) => (
              <div
                key={work.id}
                className={cn(
                  "min-w-0",
                  incompleteRowHiddenClassName(
                    index,
                    works.length,
                    AUTHOR_GRID_BREAKPOINTS,
                  ),
                )}
              >
                {renderWork(work, true)}
              </div>
            ))}
          </div>
          {hasMore ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-full"
              disabled={isLoading}
              onClick={() => void loadMore()}
            >
              {isLoading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <ChevronDownIcon className="size-4" />
              )}
              {t("もっと見る", "Show more")}
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              className="w-full rounded-full text-muted-foreground"
            >
              <Link to={props.seeAllTo}>
                {t("ユーザーページですべて見る", "See all on profile")}
                <ChevronRightIcon className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <CarouselWithGradation
            opts={authorWorksCarouselOptions}
            setApi={setApi}
            items={works.map((work) => renderWork(work, false))}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full rounded-full text-muted-foreground"
            onClick={() => changeView("grid")}
          >
            <ChevronDownIcon className="size-4" />
            {t("もっと見る", "Show more")}
          </Button>
        </div>
      )}
    </section>
  )
}

const authorMoreWorksQuery = graphql(
  `query AuthorMoreWorks($userId: ID!, $offset: Int!, $limit: Int!, $where: UserWorksWhereInput) {
    user(id: $userId) {
      id
      works(offset: $offset, limit: $limit, where: $where) {
        id
        userId
        title
        enTitle
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
        thumbnailImagePosition
        subWorksCount
        commentsCount
        isLiked
      }
    }
  }`,
)

type AuthorWorksRating = "G" | "R15" | "R18" | "R18G"

type AuthorWorksUser = {
  id: string
  login: string
  name: string
  iconUrl?: string | null
  avatarFrame?: React.ComponentProps<typeof UserAvatarWithFrame>["frame"]
  works: (Omit<Props["works"][number], "thumbnailImagePosition" | "title"> & {
    thumbnailImagePosition?: number | null
    title?: string | null
    enTitle?: string | null
  })[]
}

/**
 * 作品ページの「XXさんの作品」（見出しつき。全年齢と R18 で同じ）
 */
export function WorkAuthorWorksSection(props: {
  user: AuthorWorksUser
  currentWorkId: string
  ratings: AuthorWorksRating[]
}) {
  const t = useTranslation()
  return (
    <WorkAuthorWorks
      // 作者が変わったら読み込み済みの分を持ち越さない
      key={props.user.id}
      currentWorkId={props.currentWorkId}
      userId={props.user.id}
      ratings={props.ratings}
      works={props.user.works.map((work) => ({
        smallThumbnailImageURL: work.smallThumbnailImageURL,
        thumbnailImagePosition: work.thumbnailImagePosition ?? 0,
        smallThumbnailImageWidth: work.smallThumbnailImageWidth,
        smallThumbnailImageHeight: work.smallThumbnailImageHeight,
        id: work.id,
        title: work.title ? t.workTitle(work.title, work.enTitle) : undefined,
        userId: work.userId,
        isLiked: work.isLiked,
        subWorksCount: work.subWorksCount,
        commentsCount: work.commentsCount,
      }))}
      seeAllTo={`/users/${props.user.login}/posts`}
      renderHeader={(viewToggle) => (
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
              src={toIconImageUrl(props.user.iconUrl)}
            />
            <h2 className="truncate font-bold text-base">
              {t(`${props.user.name} の作品`, `More from ${props.user.name}`)}
            </h2>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            {viewToggle}
            <Link
              to={`/users/${props.user.login}/posts`}
              className="flex shrink-0 items-center text-muted-foreground text-sm hover:text-foreground"
            >
              {t("すべて見る", "See all")}
              <ChevronRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      )}
    />
  )
}
