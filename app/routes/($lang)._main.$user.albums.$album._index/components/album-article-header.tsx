import { Link } from "~/lib/app/locale-router"
import { type FragmentOf, graphql } from "gql.tada"
import {
  BookOpenIcon,
  ChevronRightIcon,
  ImagesIcon,
  Layers3Icon,
  PencilIcon,
  Share2Icon,
  SparklesIcon,
} from "lucide-react"
import { lazy, Suspense, useContext, useEffect, useRef, useState } from "react"
import {
  AlbumLikeButton,
  AlbumWatchButton,
} from "~/components/album/public-album-list"
import { FollowButton } from "~/components/button/follow-button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  isAdultAlbum,
  toAlbumCoverUrl,
} from "~/routes/($lang)._main.$user.albums.$album._index/album-page-utils"
import { AlbumArticleEditorDialogFragment } from "~/routes/($lang)._main.$user.albums.$album._index/components/album-article-editor-dialog-fragment"
import { CopyWorkUrlButton } from "~/routes/($lang)._main.posts.$post._index/components/work-action-copy-url"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"
import {
  toResizedImageSrcSet,
  toResizedImageUrl,
} from "~/utils/resized-image-url"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

// 編集は持ち主だけが使うので、ほかの人のページでは読まない
const AlbumArticleEditorDialog = lazy(() =>
  import(
    "~/routes/($lang)._main.$user.albums.$album._index/components/album-article-editor-dialog"
  ).then((module) => ({ default: module.AlbumArticleEditorDialog })),
)

type Props = {
  album: FragmentOf<typeof AlbumArticleHeaderFragment>
  onUpdatedAlbum?: () => void
}

/** これより幅の小さい表紙は、引き伸ばすとぼやけるので全体を収める */
const COVER_MIN_WIDTH = 480

/** 説明をたたむ文字数の目安 */
const DESCRIPTION_FOLD_LENGTH = 120

const actionClassName =
  "h-10 shrink-0 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent"

export function AlbumArticleHeader(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const album = props.album
  const firstWork = album.firstWorks[0]
  const latestWork = album.latestWorks[0]
  const coverUrl = toAlbumCoverUrl(album)
  const isOwner = authContext.userId === album.user.id
  const seriesListHref = isAdultAlbum(album) ? "/r/albums" : "/albums"
  const shareUrl = `https://www.aipictors.com/${album.user.login}/albums/${album.slug}`

  const cover = coverUrl ? (
    <AlbumCoverImage url={coverUrl} alt={album.title} />
  ) : (
    <div className="flex size-full items-center justify-center text-muted-foreground">
      <Layers3Icon className="size-10" aria-hidden="true" />
    </div>
  )

  return (
    <div className="flex flex-col gap-3 pt-2">
      <nav
        aria-label={t("パンくずリスト", "Breadcrumb")}
        className="flex items-center gap-1 whitespace-nowrap text-muted-foreground text-xs"
      >
        <Link to="/" className="shrink-0 hover:text-foreground">
          {t("ホーム", "Home")}
        </Link>
        <ChevronRightIcon className="size-3 shrink-0" aria-hidden="true" />
        <Link to={seriesListHref} className="shrink-0 hover:text-foreground">
          {t("シリーズ", "Series")}
        </Link>
        <ChevronRightIcon className="size-3 shrink-0" aria-hidden="true" />
        <span className="truncate text-foreground">{album.title}</span>
      </nav>

      <header className="relative overflow-hidden rounded-2xl border bg-card">
        {coverUrl && (
          <img
            // 強くぼかした背景なので 48px の縮小版で十分
            src={toResizedImageUrl(coverUrl, 48)}
            alt=""
            aria-hidden
            decoding="async"
            className="pointer-events-none absolute inset-0 size-full scale-110 object-cover opacity-20 blur-2xl"
          />
        )}

        {isOwner && album.user.nanoid && (
          <div className="absolute top-5 right-5 z-10 md:top-6 md:right-6">
            <Suspense
              fallback={
                <AlbumEditButton label={t("編集", "Edit")} isDisabled={true} />
              }
            >
              <AlbumArticleEditorDialog
                album={album}
                thumbnail={album.thumbnailImageURL ?? ""}
                userNanoid={album.user.nanoid}
                onUpdated={props.onUpdatedAlbum}
              >
                <AlbumEditButton label={t("編集", "Edit")} />
              </AlbumArticleEditorDialog>
            </Suspense>
          </div>
        )}

        <div className="relative grid gap-4 p-3 md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:gap-7 md:p-6">
          <div className="aspect-[1200/627] overflow-hidden rounded-xl bg-muted shadow-sm">
            {firstWork ? (
              <Link
                to={`/posts/${firstWork.id}`}
                aria-label={t("最初の作品を見る", "View the first work")}
                className="group block size-full"
              >
                {cover}
              </Link>
            ) : (
              cover
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-3 px-1 pb-1 md:px-0 md:pb-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs md:pr-20">
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Layers3Icon className="size-3.5" aria-hidden="true" />
                {t("シリーズ", "Series")}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <ImagesIcon className="size-3.5" aria-hidden="true" />
                {t(`全${album.worksCount}作品`, `${album.worksCount} works`)}
              </span>
              {album.rating !== "G" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-bold text-[11px] text-white",
                    album.rating === "R15" ? "bg-amber-700" : "bg-rose-600",
                  )}
                >
                  {album.rating}
                </span>
              )}
            </div>

            <h1 className="font-bold text-2xl leading-tight [overflow-wrap:anywhere] md:text-3xl">
              {album.title}
            </h1>

            <div className="flex min-h-9 items-center gap-3">
              <Link
                to={`/users/${album.user.login}`}
                className="flex min-w-0 items-center gap-2 hover:underline"
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarImage
                    src={withIconUrlFallback(album.user.iconUrl)}
                    alt=""
                  />
                  <AvatarFallback>{album.user.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <span className="truncate font-semibold text-sm">
                  {album.user.name}
                </span>
              </Link>
              <FollowButton
                className="h-8 w-auto min-w-24 shrink-0 px-3 text-xs"
                targetUserId={album.user.id}
                targetUserName={album.user.name}
                isFollow={album.user.isFollowee}
                isFollower={album.user.isFollower}
              />
            </div>

            <AlbumDescription description={album.description} />

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
              {firstWork && (
                <Button asChild className="h-10 w-full gap-2 px-5 sm:w-auto">
                  <Link to={`/posts/${firstWork.id}`}>
                    <BookOpenIcon className="size-4" aria-hidden="true" />
                    {t("最初から見る", "Start from the beginning")}
                  </Link>
                </Button>
              )}
              {latestWork &&
                album.worksCount > 1 &&
                latestWork.id !== firstWork?.id && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 flex-1 gap-2 bg-background sm:flex-none"
                  >
                    <Link to={`/posts/${latestWork.id}`}>
                      <SparklesIcon className="size-4" aria-hidden="true" />
                      {t("最新の作品", "Latest work")}
                    </Link>
                  </Button>
                )}
              <AlbumLikeButton
                albumId={album.id}
                ownerUserId={album.user.id}
                defaultLiked={album.isLiked}
                defaultLikesCount={album.likesCount}
                className={actionClassName}
              />
              <AlbumWatchButton
                albumId={album.id}
                defaultWatched={album.isWatched}
                className={actionClassName}
                isLabelVisible={true}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-10 bg-background"
                    aria-label={t("共有", "Share")}
                    title={t("共有", "Share")}
                  >
                    <Share2Icon className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="grid w-72 gap-2">
                  <p className="font-medium text-sm">
                    {t("シリーズを共有する", "Share this series")}
                  </p>
                  <CopyWorkUrlButton currentUrl={shareUrl} />
                  <XIntent
                    text={t(
                      `${album.user.name}さんのシリーズ「${album.title}」`,
                      `"${album.title}" by ${album.user.name}`,
                    )}
                    url={shareUrl}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

/**
 * 表紙の画像。枠は横長なので、縦長の画像や小さな画像は引き伸ばして切り抜かず、全体を枠に収める
 */
function AlbumCoverImage(props: { url: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null)
  const [isContained, setIsContained] = useState(false)

  const updateFit = () => {
    const image = ref.current

    if (image === null || image.naturalWidth === 0) {
      return
    }

    setIsContained(
      image.naturalWidth < COVER_MIN_WIDTH ||
        image.naturalHeight >= image.naturalWidth,
    )
  }

  // サーバーの HTML の画像は hydration の前に読み終わると onLoad が呼ばれない
  useEffect(() => {
    if (ref.current?.complete) {
      updateFit()
    }
  }, [props.url])

  return (
    <div className="relative size-full overflow-hidden">
      {isContained && (
        <img
          src={toResizedImageUrl(props.url, 48)}
          alt=""
          aria-hidden
          decoding="async"
          className="absolute inset-0 size-full scale-110 object-cover opacity-70 blur-xl"
        />
      )}
      <img
        ref={ref}
        // 大きく表示される最初の画像（LCP）なので、遅延させずに優先して読む
        src={toResizedImageUrl(props.url, 640)}
        srcSet={toResizedImageSrcSet(props.url, { minWidth: 320 })}
        sizes="(min-width: 768px) 416px, calc(100vw - 40px)"
        alt={props.alt}
        width={1200}
        height={627}
        fetchPriority="high"
        onLoad={updateFit}
        className={cn(
          "relative size-full transition-transform duration-300 group-hover:scale-[1.02]",
          isContained ? "object-contain" : "object-cover",
        )}
      />
    </div>
  )
}

function AlbumEditButton(
  props: React.ComponentProps<typeof Button> & {
    label: string
    isDisabled?: boolean
  },
) {
  const { label, isDisabled, ...buttonProps } = props

  return (
    <Button
      {...buttonProps}
      variant="secondary"
      disabled={isDisabled}
      className="h-9 gap-1.5 rounded-full border bg-background/90 px-3 shadow-sm backdrop-blur-sm hover:bg-background"
    >
      <PencilIcon className="size-3.5" aria-hidden="true" />
      {label}
    </Button>
  )
}

/**
 * 長い説明は 3 行にたたむ（作品の一覧が下に押し出されないように）
 */
function AlbumDescription(props: { description: string }) {
  const t = useTranslation()
  const ref = useRef<HTMLParagraphElement>(null)
  const description = props.description.trim()
  const isLong =
    description.length > DESCRIPTION_FOLD_LENGTH ||
    description.split("\n").length > 3
  const [isOpen, setIsOpen] = useState(false)
  // PC の幅では 3 行に収まることがあるので、たたむものがなければボタンを消す
  const [isFitting, setIsFitting] = useState(false)

  useEffect(() => {
    if (ref.current && !isOpen) {
      setIsFitting(ref.current.scrollHeight <= ref.current.clientHeight)
    }
  }, [isOpen, description])

  if (description.length === 0) {
    return null
  }

  return (
    <div>
      <p
        ref={ref}
        className={cn(
          "whitespace-pre-wrap text-muted-foreground text-sm leading-relaxed [overflow-wrap:anywhere]",
          isLong && !isOpen && "line-clamp-3",
        )}
      >
        {description}
      </p>
      {isLong && !isFitting && (
        <button
          type="button"
          className="mt-1 font-medium text-foreground text-xs hover:underline"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? t("閉じる", "Show less") : t("続きを読む", "Read more")}
        </button>
      )}
    </div>
  )
}

export const AlbumArticleHeaderFragment = graphql(
  `fragment AlbumArticleHeader on AlbumNode @_unmask {
    id
    title
    description
    user {
      id
      login
      name
      iconUrl
      isFollowee
      isFollower
    }
    createdAt
    isSensitive
    isLiked
    isWatched
    likesCount
    rating
    thumbnailImageURL
    slug
    worksCount
    firstWorks: works(offset: 0, limit: 1, orderBy: MANUAL) {
      id
      rating
      largeThumbnailImageURL
      smallThumbnailImageURL
    }
    latestWorks: works(offset: 0, limit: 1, orderBy: DATE_CREATED, sort: DESC) {
      id
    }
    ...AlbumArticleEditorDialog
  }`,
  [AlbumArticleEditorDialogFragment],
)
