import { gql, useMutation } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { Bookmark, Heart, Images } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { toRatingText } from "~/utils/work/to-rating-text"

type Props = {
  albums: FragmentOf<typeof PublicAlbumListItemFragment>[]
}

export function PublicAlbumList(props: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
      {props.albums.map((album) => (
        <PublicAlbumCard key={album.id} album={album} />
      ))}
    </div>
  )
}

function PublicAlbumCard(props: {
  album: FragmentOf<typeof PublicAlbumListItemFragment>
}) {
  const album = props.album

  const href = `/${album.user.login}/albums/${album.slug}`

  const coverUrl =
    album.thumbnailImageURL || album.works[0]?.smallThumbnailImageURL || ""

  const isAdult = album.rating === "R18" || album.rating === "R18G"

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
      <Link to={href} className="relative block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {coverUrl ? (
            <img
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              src={coverUrl}
              alt={album.title}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Images className="size-8" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/55 to-transparent" />
          <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 font-semibold text-white text-xs backdrop-blur-sm">
            <Images className="size-3.5" aria-hidden="true" />
            {album.worksCount}
          </span>
          {album.rating !== "G" && (
            <span
              className={cn(
                "absolute top-2 left-2 rounded-full px-2 py-0.5 font-bold text-white text-xs",
                isAdult ? "bg-rose-600" : "bg-amber-700",
              )}
            >
              {toRatingText(album.rating as never)}
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link to={href} className="block space-y-1">
          <h3 className="line-clamp-2 font-bold text-sm leading-snug md:text-base">
            {album.title}
          </h3>
          {album.description.trim().length > 0 && (
            <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
              {album.description}
            </p>
          )}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Link
            to={`/users/${album.user.login}`}
            className="flex min-w-0 items-center gap-1.5 text-xs hover:underline"
          >
            <Avatar className="size-6">
              <AvatarImage
                src={withIconUrlFallback(album.user.iconUrl)}
                alt=""
              />
              <AvatarFallback className="text-[10px]">
                {album.user.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{album.user.name}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <AlbumWatchButton
              albumId={album.id}
              defaultWatched={album.isWatched}
            />
            <AlbumLikeButton
              albumId={album.id}
              ownerUserId={album.user.id}
              defaultLiked={album.isLiked}
              defaultLikesCount={album.likesCount}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

type AlbumLikeButtonProps = {
  albumId: string
  ownerUserId: string
  defaultLiked: boolean
  defaultLikesCount: number
}

const iconButtonClassName =
  "flex h-8 items-center gap-1 rounded-full px-2 text-xs transition hover:bg-muted disabled:opacity-60"

function AlbumLikeButton(props: AlbumLikeButtonProps) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [createAlbumLike] = useMutation(CREATE_ALBUM_LIKE_MUTATION)
  const [deleteAlbumLike] = useMutation(DELETE_ALBUM_LIKE_MUTATION)
  const [isLiked, setIsLiked] = useState(props.defaultLiked)
  const [likesCount, setLikesCount] = useState(props.defaultLikesCount)
  const [isPending, setIsPending] = useState(false)
  // 押した後は、あとから届いた古い一覧の値で表示を戻さない
  const touchedRef = useRef(false)

  useEffect(() => {
    touchedRef.current = false
  }, [props.albumId])

  useEffect(() => {
    if (touchedRef.current) {
      return
    }
    setIsLiked(props.defaultLiked)
    setLikesCount(props.defaultLikesCount)
  }, [props.defaultLiked, props.defaultLikesCount])

  const isOwner = authContext.userId === props.ownerUserId

  const label = isLiked
    ? t("いいねを取り消す", "Unlike")
    : t("シリーズにいいね", "Like series")

  const onClick = async () => {
    if (isPending) {
      return
    }

    touchedRef.current = true

    const prevLiked = isLiked
    const prevCount = likesCount
    const nextLiked = !prevLiked

    setIsLiked(nextLiked)
    setLikesCount(Math.max(0, prevCount + (nextLiked ? 1 : -1)))
    setIsPending(true)

    try {
      const variables = { input: { albumId: props.albumId } }
      const result = nextLiked
        ? (await createAlbumLike({ variables })).data?.createAlbumLike
        : (await deleteAlbumLike({ variables })).data?.deleteAlbumLike

      if (result) {
        setIsLiked(result.isLiked)
        setLikesCount(result.likesCount)
      }
    } catch (error) {
      console.error("Error updating album like", error)
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
    } finally {
      setIsPending(false)
    }
  }

  const content = (
    <>
      <Heart
        className={cn("size-4", isLiked && "fill-rose-500 text-rose-500")}
        aria-hidden="true"
      />
      <span className={cn("tabular-nums", isLiked && "text-rose-600")}>
        {likesCount}
      </span>
    </>
  )

  // 自分のシリーズはいいねできないので数だけ出す
  if (isOwner) {
    return (
      <span
        className="flex h-8 items-center gap-1 px-2 text-muted-foreground text-xs"
        title={t("いいね", "Likes")}
      >
        <Heart className="size-4" aria-hidden="true" />
        <span className="tabular-nums">{likesCount}</span>
      </span>
    )
  }

  if (authContext.isLoggedIn) {
    return (
      <button
        type="button"
        className={iconButtonClassName}
        aria-label={label}
        aria-pressed={isLiked}
        title={label}
        disabled={isPending}
        onClick={onClick}
      >
        {content}
      </button>
    )
  }

  if (authContext.isLoading) {
    return (
      <button type="button" className={iconButtonClassName} disabled>
        {content}
      </button>
    )
  }

  return (
    <LoginDialogButton
      description={t(
        "シリーズにいいねするにはログインが必要です。",
        "You need to log in to like a series.",
      )}
      triggerChildren={
        <button
          type="button"
          className={iconButtonClassName}
          aria-label={label}
          title={label}
        >
          {content}
        </button>
      }
    />
  )
}

type AlbumWatchButtonProps = {
  albumId: string
  defaultWatched: boolean
}

function AlbumWatchButton(props: AlbumWatchButtonProps) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [watchAlbum] = useMutation(WATCH_ALBUM_MUTATION)
  const [unwatchAlbum] = useMutation(UNWATCH_ALBUM_MUTATION)
  const [isWatched, setIsWatched] = useState(props.defaultWatched)
  const [isPending, setIsPending] = useState(false)
  const touchedRef = useRef(false)

  useEffect(() => {
    touchedRef.current = false
  }, [props.albumId])

  useEffect(() => {
    if (touchedRef.current) {
      return
    }
    setIsWatched(props.defaultWatched)
  }, [props.defaultWatched])

  const label = isWatched
    ? t("お気に入り解除", "Remove favorite")
    : t("お気に入り登録", "Add favorite")

  const onClick = async () => {
    if (isPending) {
      return
    }

    touchedRef.current = true

    const prevWatched = isWatched
    const nextWatched = !prevWatched

    setIsWatched(nextWatched)
    setIsPending(true)

    try {
      const variables = { input: { albumId: props.albumId } }
      const result = nextWatched
        ? (await watchAlbum({ variables })).data?.watchAlbum
        : (await unwatchAlbum({ variables })).data?.unwatchAlbum

      if (result) {
        setIsWatched(result.isWatched)
      }
    } catch (error) {
      console.error("Error updating album watch", error)
      setIsWatched(prevWatched)
    } finally {
      setIsPending(false)
    }
  }

  const icon = (
    <Bookmark
      className={cn("size-4", isWatched && "fill-amber-500 text-amber-500")}
      aria-hidden="true"
    />
  )

  if (authContext.isLoggedIn) {
    return (
      <button
        type="button"
        className={iconButtonClassName}
        aria-label={label}
        aria-pressed={isWatched}
        title={label}
        disabled={isPending}
        onClick={onClick}
      >
        {icon}
      </button>
    )
  }

  if (authContext.isLoading) {
    return (
      <button type="button" className={iconButtonClassName} disabled>
        {icon}
      </button>
    )
  }

  return (
    <LoginDialogButton
      description={t(
        "シリーズをお気に入り登録するにはログインが必要です。",
        "You need to log in to favorite a series.",
      )}
      triggerChildren={
        <button
          type="button"
          className={iconButtonClassName}
          aria-label={label}
          title={label}
        >
          {icon}
        </button>
      }
    />
  )
}

export const PublicAlbumListItemFragment = graphql(
  `fragment PublicAlbumListItem on AlbumNode @_unmask {
    id
    isLiked
    isWatched
    likesCount
    slug
    title
    description
    rating
    worksCount
    thumbnailImageURL
    user {
      id
      login
      name
      iconUrl
    }
    works(limit: 1, offset: 0) {
      smallThumbnailImageURL
    }
  }`,
)

const CREATE_ALBUM_LIKE_MUTATION = gql`
  mutation CreateAlbumLike($input: CreateAlbumLikeInput!) {
    createAlbumLike(input: $input) {
      id
      isLiked
      likesCount
    }
  }
`

const DELETE_ALBUM_LIKE_MUTATION = gql`
  mutation DeleteAlbumLike($input: DeleteAlbumLikeInput!) {
    deleteAlbumLike(input: $input) {
      id
      isLiked
      likesCount
    }
  }
`

const WATCH_ALBUM_MUTATION = gql`
  mutation WatchAlbum($input: WatchAlbumInput!) {
    watchAlbum(input: $input) {
      id
      isWatched
    }
  }
`

const UNWATCH_ALBUM_MUTATION = gql`
  mutation UnwatchAlbum($input: UnwatchAlbumInput!) {
    unwatchAlbum(input: $input) {
      id
      isWatched
    }
  }
`
