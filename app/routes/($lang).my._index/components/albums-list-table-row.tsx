import { TableRow, TableCell } from "@/components/ui/table"
import { Loader2Icon, TrashIcon } from "lucide-react"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"

type Props = {
  album: {
    id: string
    userId: string
    title: string
    slug: string
    thumbnailImageUrl: string
    createdAt: string
  }
}

/**
 * シリーズ一覧テーブルの項目
 */
export const AlbumsListTableRow = (props: Props) => {
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
        <TableRow
          style={{
            opacity: isDeleted ? 0 : 1,
            transition: "opacity 1s ease-out",
          }}
        >
          <TableCell className="font-medium">
            <Link to={`/${props.album.userId}/albums/${props.album.slug}`}>
              <div className="w-32 overflow-hidden text-ellipsis">
                {props.album.title}
              </div>
            </Link>
          </TableCell>
          <TableCell>
            <Link to={`/${props.album.userId}/albums/${props.album.slug}`}>
              <img
                src={props.album.thumbnailImageUrl}
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
          <TableCell>{props.album.createdAt}</TableCell>
        </TableRow>
      )}
    </>
  )
}

const deleteAlbumMutation = graphql(
  `mutation DeleteAlbum($input: DeleteAlbumInput!) {
    deleteAlbum(input: $input) {
      id
    }
  }`,
)
