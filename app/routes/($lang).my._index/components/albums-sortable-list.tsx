import { useMutation } from "@apollo/client/index"
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { GripVertical, Loader2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AlbumDeleteConfirmDialog } from "~/routes/($lang).my._index/components/album-delete-confirm-dialog"
import { toDateTimeText } from "~/utils/to-date-time-text"

type Props = {
  albums: FragmentOf<typeof SortableAlbumListItemFragment>[]
  refetch: () => void
}

type SortableItemProps = {
  album: FragmentOf<typeof SortableAlbumListItemFragment>
  onDelete: (albumId: string) => Promise<void>
  isDeleting: boolean
}

function SortableItem(props: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.album.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm"
    >
      <button
        type="button"
        className="cursor-grab rounded-md p-2 text-muted-foreground hover:bg-muted"
        aria-label="シリーズの順序を変更"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>
      <Link
        to={`/${props.album.user.login}/albums/${props.album.slug}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <img
          src={props.album.thumbnailImageURL ?? undefined}
          alt={props.album.title}
          className="h-16 w-16 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{props.album.title}</div>
          <div className="text-sm text-muted-foreground">
            {toDateTimeText(props.album.createdAt)}
          </div>
        </div>
      </Link>
      <div className="flex w-12 justify-end">
        {props.isDeleting ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <AlbumDeleteConfirmDialog
            onDelete={() => props.onDelete(props.album.id)}
            seriesTitle={props.album.title}
          />
        )}
      </div>
    </div>
  )
}

export function SortableAlbumsList(props: Props) {
  const [orderedAlbums, setOrderedAlbums] = useState(props.albums)
  const [deleteAlbum, { loading: isDeleting }] = useMutation(deleteAlbumMutation)
  const [updateAlbumsOrder] = useMutation(updateAlbumsOrderMutation)

  useEffect(() => {
    setOrderedAlbums(props.albums)
  }, [props.albums])

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))

  const persistOrder = async (nextAlbums: FragmentOf<typeof SortableAlbumListItemFragment>[]) => {
    try {
      await updateAlbumsOrder({
        variables: {
          input: {
            albumIds: nextAlbums.map((album) => album.id),
          },
        },
      })
      toast("シリーズの並び順を更新しました")
      props.refetch()
    } catch {
      toast("シリーズの並び順の更新に失敗しました")
      setOrderedAlbums(props.albums)
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = orderedAlbums.findIndex((album) => album.id === active.id)
    const newIndex = orderedAlbums.findIndex((album) => album.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const nextAlbums = arrayMove(orderedAlbums, oldIndex, newIndex)
    setOrderedAlbums(nextAlbums)
    await persistOrder(nextAlbums)
  }

  const onDelete = async (albumId: string) => {
    await deleteAlbum({
      variables: {
        input: {
          albumId,
        },
      },
    })
    toast("シリーズを削除しました")
    props.refetch()
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
        ドラッグしてシリーズの順序を変更できます。
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={orderedAlbums.map((album) => album.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {orderedAlbums.map((album) => (
              <SortableItem
                key={album.id}
                album={album}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export const SortableAlbumListItemFragment = graphql(
  `fragment SortableAlbumListItem on AlbumNode @_unmask {
    id
    title
    createdAt
    thumbnailImageURL
    slug
    user {
      login
    }
  }`,
)

const updateAlbumsOrderMutation = graphql(
  `mutation UpdateAlbumsOrder($input: UpdateAlbumsOrderInput!) {
    updateAlbumsOrder(input: $input)
  }`,
)

const deleteAlbumMutation = graphql(
  `mutation DeleteAlbumForSort($input: DeleteAlbumInput!) {
    deleteAlbum(input: $input) {
      id
    }
  }`,
)