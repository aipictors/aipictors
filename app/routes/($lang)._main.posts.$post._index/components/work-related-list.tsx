/**
 * 作品の関連作品一覧
 */

import { useApolloClient } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import type { EmblaCarouselType } from "embla-carousel"
import { graphql } from "gql.tada"
import { ChevronRightIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { CarouselWithGradation } from "~/components/carousel-with-gradation"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import type { CarouselApi } from "~/components/ui/carousel"
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

/**
 * 作者の他の作品（横スクロール）。端に近づいたら続きを読む
 */
export function WorkAuthorWorks(props: {
  works: Props["works"]
  currentWorkId: string
  userId: string
  ratings: AuthorWorksRating[]
  header: React.ReactNode
}) {
  const client = useApolloClient()
  const [api, setApi] = useState<CarouselApi>()
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
            title: work.title ?? undefined,
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
    }
  }, [client, props.userId, props.ratings])

  useEffect(() => {
    if (!api) {
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
  }, [api, loadMore])

  if (works.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      {props.header}
      <WorkLazySection minHeightClassName="min-h-32">
        <CarouselWithGradation
          opts={authorWorksCarouselOptions}
          setApi={setApi}
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

const authorMoreWorksQuery = graphql(
  `query AuthorMoreWorks($userId: ID!, $offset: Int!, $limit: Int!, $where: UserWorksWhereInput) {
    user(id: $userId) {
      id
      works(offset: $offset, limit: $limit, where: $where) {
        id
        userId
        title
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
