import { type FragmentOf, graphql } from "gql.tada"
import {
  ChevronRightIcon,
  FolderHeartIcon,
  ImagesIcon,
  LockIcon,
  Settings2Icon,
  Share2Icon,
} from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
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
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import {
  toCollectionCoverUrl,
  toCollectionTags,
} from "~/routes/($lang)._main.collections.$collection/collection-page-utils"
import { CopyWorkUrlButton } from "~/routes/($lang)._main.posts.$post._index/components/work-action-copy-url"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import { toIconImageUrl } from "~/utils/with-icon-url-fallback"

type Props = {
  collection: FragmentOf<typeof CollectionHeaderFragment>
}

/** 説明をたたむ文字数の目安 */
const DESCRIPTION_FOLD_LENGTH = 120

/**
 * コレクションの見出し（シリーズの見出しと同じ並び: 表紙・題名・作成者・説明・タグ・共有）
 * 以前は表紙が未設定だと壊れた画像になり、空のタグ（""）が /tags/ へのリンクとして出ていた
 */
export function CollectionHeader(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const collection = props.collection
  const user = collection.user
  const coverUrl = toCollectionCoverUrl(collection)
  const tags = toCollectionTags(collection.tags)
  const title = collection.title.trim() || t("無題のコレクション", "Untitled")
  const worksCount = collection.worksCount ?? 0
  const isOwner = user !== null && authContext.userId === user.id
  const shareUrl = `https://www.aipictors.com/collections/${collection.nanoid}`

  return (
    <div className="flex flex-col gap-3 pt-2">
      <nav
        aria-label={t("パンくずリスト", "Breadcrumb")}
        className="flex items-center gap-1 whitespace-nowrap text-muted-foreground text-xs"
      >
        <Link to="/" className="shrink-0 hover:text-foreground">
          {t("ホーム", "Home")}
        </Link>
        {user && (
          <>
            <ChevronRightIcon className="size-3 shrink-0" aria-hidden="true" />
            <Link
              to={`/users/${user.login}/collections`}
              className="min-w-0 max-w-40 truncate hover:text-foreground"
            >
              {t(`${user.name}のコレクション`, `${user.name}'s collections`)}
            </Link>
          </>
        )}
        <ChevronRightIcon className="size-3 shrink-0" aria-hidden="true" />
        <span className="truncate text-foreground">{title}</span>
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

        <div className="relative grid gap-4 p-3 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-7 md:p-6">
          <div className="aspect-[1200/627] overflow-hidden rounded-xl bg-muted shadow-sm">
            {coverUrl ? (
              <img
                src={toResizedImageUrl(coverUrl, 640)}
                alt={title}
                width={1200}
                height={627}
                fetchPriority="high"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <FolderHeartIcon className="size-10" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-3 px-1 pb-1 md:px-0 md:pb-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <FolderHeartIcon className="size-3.5" aria-hidden="true" />
                {t("コレクション", "Collection")}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <ImagesIcon className="size-3.5" aria-hidden="true" />
                {t(
                  `${worksCount.toLocaleString()}作品`,
                  `${worksCount.toLocaleString()} works`,
                )}
              </span>
              {collection.isPrivate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-bold text-[11px] text-foreground">
                  <LockIcon className="size-3" aria-hidden="true" />
                  {t("非公開", "Private")}
                </span>
              )}
              {collection.rating && collection.rating !== "G" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-bold text-[11px] text-white",
                    collection.rating === "R15" ? "bg-amber-700" : "bg-rose-600",
                  )}
                >
                  {collection.rating}
                </span>
              )}
            </div>

            <h1 className="font-bold text-2xl leading-tight [overflow-wrap:anywhere] md:text-3xl">
              {title}
            </h1>

            {user && (
              <div className="flex min-h-9 items-center gap-3">
                <Link
                  to={`/users/${user.login}`}
                  className="flex min-w-0 items-center gap-2 hover:underline"
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={toIconImageUrl(user.iconUrl)} alt="" />
                    <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate font-semibold text-sm">
                    {user.name}
                  </span>
                </Link>
                {!isOwner && (
                  <FollowButton
                    className="h-8 w-auto min-w-24 shrink-0 px-3 text-xs"
                    targetUserId={user.id}
                    targetUserName={user.name}
                    isFollow={user.isFollowee}
                    isFollower={user.isFollower}
                  />
                )}
              </div>
            )}

            <CollectionDescription description={collection.description} />

            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      to={`/tags/${encodeURIComponent(tag)}`}
                      className="inline-flex h-7 items-center rounded-full bg-muted px-3 text-xs hover:bg-accent"
                    >
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
              {isOwner && (
                <Button asChild variant="outline" className="h-10 gap-2 bg-background">
                  <Link to="/my/folders">
                    <Settings2Icon className="size-4" aria-hidden="true" />
                    {t("コレクションを管理", "Manage collections")}
                  </Link>
                </Button>
              )}
              {!collection.isPrivate && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 gap-2 bg-background"
                      aria-label={t("共有", "Share")}
                    >
                      <Share2Icon className="size-4" aria-hidden="true" />
                      {t("共有", "Share")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="grid w-72 gap-2">
                    <p className="font-medium text-sm">
                      {t("コレクションを共有する", "Share this collection")}
                    </p>
                    <CopyWorkUrlButton currentUrl={shareUrl} />
                    <XIntent
                      text={t(
                        `${user?.name ?? ""}さんのコレクション「${title}」`,
                        `"${title}" by ${user?.name ?? ""}`,
                      )}
                      url={shareUrl}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

/**
 * 長い説明は 3 行にたたむ（作品の一覧が下に押し出されないように）
 */
function CollectionDescription(props: { description: string }) {
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

export const CollectionHeaderFragment = graphql(
  `fragment CollectionHeader on FolderNode @_unmask {
    id
    nanoid
    title
    description
    tags
    isPrivate
    isSensitive
    rating
    thumbnailImageURL
    worksCount
    user {
      id
      login
      name
      iconUrl
      isFollowee
      isFollower
    }
    firstWorks: works(offset: 0, limit: 1) {
      id
      rating
      largeThumbnailImageURL
    }
  }`,
)
