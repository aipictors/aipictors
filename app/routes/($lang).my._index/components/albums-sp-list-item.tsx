import { Separator } from "~/components/ui/separator"
import { Loader2Icon, TrashIcon } from "lucide-react"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { useMutation } from "@apollo/client/index"
import { toast } from "sonner"
import { useEffect, useState } from "react"
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
 * スマホ向けシリーズ一覧のアイテム
 */
export function AlbumsSpListItem(props: Props) {
  const [deleteWork, { loading: isLoadingDeleteAlbum }] =
    useMutation(deleteWorkMutation)

  const onDeleteSeries = async (workId: string) => {
    await deleteWork({
      variables: {
        input: {
          workId: workId,
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
              to={`/${props.album.userId}/albums/${props.album.slug}`}
              className="mr-2"
            >
              <img
                src={props.album.thumbnailImageUrl}
                alt=""
                className="mr-4 h-[72px] w-[72px] min-w-[72px] rounded-md object-cover"
              />
            </Link>
            <div className="w-full space-y-2">
              <div className="w-full space-y-2">
                <Link to={`/${props.album.userId}/albums/${props.album.slug}`}>
                  <div className="w-full font-bold">{props.album.title}</div>
                </Link>
                <div className="text-sm opacity-80">
                  {props.album.createdAt}
                </div>
              </div>
            </div>
            <div className="flex w-16 justify-center">
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
            </div>
          </div>
          <Separator />
        </>
      )}
    </>
  )
}

const deleteWorkMutation = graphql(
  `mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
    }
  }`,
)
