import { gql, useMutation } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { Bookmark, Heart, Images } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { toRatingText } from "~/utils/work/to-rating-text"

type Props = {
  albums: FragmentOf<typeof PublicAlbumListItemFragment>[]
}

export function PublicAlbumList(props: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {props.albums.map((album) => (
        <div
          key={album.id}
          className="group overflow-hidden rounded-lg border bg-card"
        >
          <Link
            to={`/${album.user.login}/albums/${album.slug}`}
            className="block"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
              <img
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                src={
                  album.thumbnailImageURL ||
                  album.works[0]?.smallThumbnailImageURL ||
                  ""
                }
                alt={album.title}
              />
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge variant="secondary">
                  {toRatingText(album.rating as never)}
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 border-border/40 bg-background/80"
                >
                  <Images className="size-3" />
                  {album.worksCount}
                </Badge>
              </div>
            </div>
          </Link>
          <div className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0 flex-1 space-y-1">
              <Link
                to={`/${album.user.login}/albums/${album.slug}`}
                className="block"
              >
                <p className="line-clamp-1 font-medium text-sm">
                  {album.title}
                </p>
                <p className="line-clamp-2 text-muted-foreground text-xs">
                  {album.description}
                </p>
              </Link>
              <p className="text-muted-foreground text-xs">{album.user.name}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <AlbumWatchButton
                albumId={album.id}
                albumTitle={album.title}
                defaultWatched={album.isWatched}
              />
              <AlbumLikeButton
                albumId={album.id}
                albumTitle={album.title}
                ownerUserId={album.user.id}
                defaultLiked={album.isLiked}
                defaultLikesCount={album.likesCount}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

type AlbumLikeButtonProps = {
  albumId: string
  albumTitle: string
  ownerUserId: string
  defaultLiked: boolean
  defaultLikesCount: number
}

function AlbumLikeButton(props: AlbumLikeButtonProps) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [createAlbumLike] = useMutation(CREATE_ALBUM_LIKE_MUTATION)
  const [deleteAlbumLike] = useMutation(DELETE_ALBUM_LIKE_MUTATION)
  const [isLiked, setIsLiked] = useState(props.defaultLiked)
  const [likesCount, setLikesCount] = useState(props.defaultLikesCount)

  useEffect(() => {
    setIsLiked(props.defaultLiked)
    setLikesCount(props.defaultLikesCount)
  }, [props.defaultLiked, props.defaultLikesCount, props.albumId])

  if (authContext.userId === props.ownerUserId) {
    return null
  }

  const trigger = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-8 gap-1 px-2 text-xs",
        isLiked && "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
      )}
      aria-label={t("シリーズにいいね", "Like series")}
      title={t("シリーズにいいね", "Like series")}
      onClick={
        authContext.isLoggedIn
          ? async () => {
              const nextLiked = !isLiked
              const nextLikesCount = likesCount + (nextLiked ? 1 : -1)

              setIsLiked(nextLiked)
              setLikesCount(nextLikesCount)

              try {
                if (nextLiked) {
                  await createAlbumLike({
                    variables: {
                      input: {
                        albumId: props.albumId,
                      },
                    },
                  })
                } else {
                  await deleteAlbumLike({
                    variables: {
                      input: {
                        albumId: props.albumId,
                      },
                    },
                  })
                }
              } catch (error) {
                console.error("Error updating album like", error)
                setIsLiked(isLiked)
                setLikesCount(likesCount)
              }
            }
          : undefined
      }
    >
      <Heart className={cn("size-3.5", isLiked && "fill-current")} />
      <span>{likesCount}</span>
    </Button>
  )

  if (authContext.isLoggedIn) {
    return trigger
  }

  if (authContext.isLoading) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1 px-2 text-xs"
        disabled
      >
        <Heart className="size-3.5" />
        <span>{likesCount}</span>
      </Button>
    )
  }

  return (
    <LoginDialogButton
      description={t(
        "シリーズにいいねするにはログインが必要です。",
        "You need to log in to like a series.",
      )}
      triggerChildren={trigger}
    />
  )
}

type AlbumWatchButtonProps = {
  albumId: string
  albumTitle: string
  defaultWatched: boolean
}

function AlbumWatchButton(props: AlbumWatchButtonProps) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [watchAlbum] = useMutation(WATCH_ALBUM_MUTATION)
  const [unwatchAlbum] = useMutation(UNWATCH_ALBUM_MUTATION)
  const [isWatched, setIsWatched] = useState(props.defaultWatched)

  useEffect(() => {
    setIsWatched(props.defaultWatched)
  }, [props.defaultWatched, props.albumId])

  const trigger = (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "size-8",
        isWatched &&
          "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100",
      )}
      aria-label={
        isWatched
          ? t("お気に入り解除", "Remove favorite")
          : t("お気に入り登録", "Add favorite")
      }
      title={
        isWatched
          ? t("お気に入り解除", "Remove favorite")
          : t("お気に入り登録", "Add favorite")
      }
      onClick={
        authContext.isLoggedIn
          ? async () => {
              const nextWatched = !isWatched
              setIsWatched(nextWatched)

              try {
                if (nextWatched) {
                  await watchAlbum({
                    variables: {
                      input: {
                        albumId: props.albumId,
                      },
                    },
                  })
                } else {
                  await unwatchAlbum({
                    variables: {
                      input: {
                        albumId: props.albumId,
                      },
                    },
                  })
                }
              } catch (error) {
                console.error("Error updating album watch", error)
                setIsWatched(isWatched)
              }
            }
          : undefined
      }
    >
      <Bookmark className={cn("size-3.5", isWatched && "fill-current")} />
    </Button>
  )

  if (authContext.isLoggedIn) {
    return trigger
  }

  if (authContext.isLoading) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8"
        disabled
      >
        <Bookmark className="size-3.5" />
      </Button>
    )
  }

  return (
    <LoginDialogButton
      description={t(
        "シリーズをお気に入り登録するにはログインが必要です。",
        "You need to log in to favorite a series.",
      )}
      triggerChildren={trigger}
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
