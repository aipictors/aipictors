import { Separator } from "~/components/ui/separator"
import { Loader2Icon } from "lucide-react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { AlbumDeleteConfirmDialog } from "~/routes/($lang).my._index/components/album-delete-confirm-dialog"

type Props = {
  album: FragmentOf<typeof MobileAlbumListItemFragment>
}

/**
 * スマホ向けシリーズ一覧のアイテム
 */
export function AlbumsSpListItem(props: Props) {
  const [deleteAlbum, { loading: isLoadingDeleteAlbum }] =
    useMutation(deleteAlbumMutation)

  const onDeleteSeries = async (id: string) => {
    await deleteAlbum({
      variables: {
        input: {
          albumId: id,
        },
      },
    })
    toast("シリーズを削除しました")
    setIsDeleted(true)
  }

  const [isDeleted, setIsDeleted] = useState(false)

  // isDeletedがtrueになったら、0.5秒後に非表示にする
  useEffect(() => {
    if (isDeleted) {
      const timer = setTimeout(() => {
        setIsHidden(true)
      }, 140)
      return () => clearTimeout(timer)
    }
  }, [isDeleted])

  const [isHidden, setIsHidden] = useState(false)

  return (
    <>
      {!isHidden && (
        <>
          <div
            className="mt-2 mb-2 flex"
            style={{
              opacity: isDeleted ? 0 : 1,
              transition: "opacity 1s ease-out",
            }}
          >
            <Link
              to={`/${props.album.user.login}/albums/${props.album.slug}`}
              className="mr-2"
            >
              <img
                src={props.album.thumbnailImageURL ?? undefined}
                alt=""
                className="mr-4 h-[72px] w-[72px] min-w-[72px] rounded-md object-cover"
              />
            </Link>
            <div className="w-full space-y-2">
              <div className="w-full space-y-2">
                <Link
                  to={`/${props.album.user.login}/albums/${props.album.slug}`}
                >
                  <div className="w-full font-bold">{props.album.title}</div>
                </Link>
                <div className="text-sm opacity-80">
                  {toDateTimeText(props.album.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex w-16 justify-center">
              {isLoadingDeleteAlbum ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <AlbumDeleteConfirmDialog
                  onDelete={() => onDeleteSeries(props.album.id)}
                  seriesTitle={props.album.title}
                />
              )}
            </div>
          </div>
          <Separator />
        </>
      )}
    </>
  )
}

export const MobileAlbumListItemFragment = graphql(
  `fragment MobileAlbumListItem on AlbumNode @_unmask {
    id
    title
    createdAt
    userId
    user {
      login
    }
    thumbnailImageURL
    slug
  }`,
)

const deleteAlbumMutation = graphql(
  `mutation DeleteAlbum($input: DeleteAlbumInput!) {
    deleteAlbum(input: $input) {
      id
    }
  }`,
)
