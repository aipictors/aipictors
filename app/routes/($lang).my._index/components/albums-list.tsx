import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import {
  MY_COLLECTION_GRID_CLASS,
  MyCollectionCard,
} from "~/routes/($lang).my._index/components/my-collection-card"
import {
  SortableAlbumListItemFragment,
  SortableAlbumsList,
} from "~/routes/($lang).my._index/components/albums-sortable-list"

type Album = {
  id: string
  title: string
  createdAt: number
  thumbnailImageURL?: string | null
  slug?: string | null
  worksCount?: number | null
  user: { login: string }
}

type Props = {
  albums: Album[]
  refetch: () => void
  orderBy: IntrospectionEnum<"AlbumOrderBy">
}

/**
 * シリーズ一覧
 */
export function AlbumsList(props: Props) {
  const t = useTranslation()
  const [deletingAlbum, setDeletingAlbum] = useState<Album | null>(null)
  const [deleteAlbum, { loading }] = useMutation(deleteAlbumMutation)

  if (props.orderBy === "MANUAL") {
    return (
      <SortableAlbumsList
        albums={props.albums as never}
        refetch={props.refetch}
      />
    )
  }

  const onDelete = async () => {
    if (deletingAlbum === null) return
    try {
      await deleteAlbum({ variables: { input: { albumId: deletingAlbum.id } } })
      toast(t("シリーズを削除しました", "Series deleted"))
      props.refetch()
    } catch (error) {
      toast(
        error instanceof Error
          ? error.message
          : t("削除できませんでした", "Could not delete"),
      )
    }
    setDeletingAlbum(null)
  }

  return (
    <>
      <ul className={MY_COLLECTION_GRID_CLASS}>
        {props.albums.map((album) => (
          <MyCollectionCard
            key={album.id}
            to={`/${album.user.login}/albums/${album.slug}`}
            title={album.title}
            thumbnailUrl={album.thumbnailImageURL}
            worksCount={album.worksCount}
            createdAt={album.createdAt}
            onDelete={() => setDeletingAlbum(album)}
          />
        ))}
      </ul>
      <AlertDialog
        open={deletingAlbum !== null}
        onOpenChange={(open) => {
          if (!open && !loading) setDeletingAlbum(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(
                `「${deletingAlbum?.title}」を削除しますか？`,
                `Delete "${deletingAlbum?.title}"?`,
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "シリーズだけを削除します。中の作品は消えません。",
                "Only the series is deleted. Its works stay.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              {t("キャンセル", "Cancel")}
            </AlertDialogCancel>
            <Button variant="destructive" disabled={loading} onClick={onDelete}>
              {t("削除する", "Delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export const AlbumListItemFragment = graphql(
  `fragment AlbumListItem on AlbumNode @_unmask {
    id
    title
    createdAt
    thumbnailImageURL
    slug
    worksCount
    userId
    user {
      login
    }
    ...SortableAlbumListItem
  }`,
  [SortableAlbumListItemFragment],
)

const deleteAlbumMutation = graphql(
  `mutation DeleteAlbum($input: DeleteAlbumInput!) {
    deleteAlbum(input: $input) {
      id
    }
  }`,
)
