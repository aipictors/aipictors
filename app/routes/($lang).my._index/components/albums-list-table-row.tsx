import { TableRow, TableCell } from "~/components/ui/table"
import { Loader2Icon, TrashIcon } from "lucide-react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { Link } from "react-router"
import { type FragmentOf, graphql } from "gql.tada"
import { toDateTimeText } from "~/utils/to-date-time-text"

type Props = {
  album: FragmentOf<typeof AlbumTableRowFragment>
}

/**
 * シリーズ一覧テーブルの項目
 */
export function AlbumsListTableRow(props: Props) {
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

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  return (
    <>
      {!isHidden && (
        <TableRow
          style={{
            opacity: isDeleted ? 0 : 1,
            transition: "opacity 1s ease-out",
          }}
        >
          <TableCell className="font-medium">
            <Link to={`/${props.album.user.login}/albums/${props.album.slug}`}>
              <div className="w-32 overflow-hidden text-ellipsis">
                {truncateTitle(props.album.title, 32)}
              </div>
            </Link>
          </TableCell>
          <TableCell>
            <Link to={`/${props.album.user.login}/albums/${props.album.slug}`}>
              <img
                src={props.album.thumbnailImageURL ?? undefined}
                alt="thumbnail"
                className="h-[80px] w-[80px] min-w-[80px] rounded-md object-cover"
              />
            </Link>
          </TableCell>
          <TableCell>
            {isLoadingDeleteAlbum ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <AppConfirmDialog
                title={"確認"}
                description={`シリーズ「${props.album.title}」を削除しますか？`}
                onNext={async () => {
                  await onDeleteSeries(props.album.id)
                }}
                onCancel={() => {}}
              >
                <TrashIcon />
              </AppConfirmDialog>
            )}
          </TableCell>
          <TableCell>{toDateTimeText(props.album.createdAt)}</TableCell>
        </TableRow>
      )}
    </>
  )
}

export const AlbumTableRowFragment = graphql(
  `fragment AlbumTableRow on AlbumNode @_unmask {
    id
    title
    createdAt
    thumbnailImageURL
    userId
    slug
    user {
      login
    }
  }`,
)

const deleteAlbumMutation = graphql(
  `mutation DeleteAlbum($input: DeleteAlbumInput!) {
    deleteAlbum(input: $input) {
      id
    }
  }`,
)
