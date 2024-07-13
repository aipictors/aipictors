import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import type { TSortableItem } from "@/_components/drag/sortable-item"
import type React from "react"
import { useState } from "react"
import { ImageItem } from "@/_components/drag/image-item"
import { SortableItem } from "@/_components/drag/sortable-item"

type Props = {
  items: TSortableItem[]
  setItems: (items: TSortableItem[]) => void
  setIndexList(value: number[]): void
  isDeletable?: boolean
  optionalButton?: React.ReactNode
  onClickOptionButton?: (id: number) => void
  dummyEnableDragItem?: React.ReactNode // アイテム一覧に並び替えできないダミーアイテム
}

/**
 * 指定された要素をドラッグで並び替えできるようにする
 */
export const SortableItems = (props: Props) => {
  const [activeItem, setActiveItem] = useState<TSortableItem>()

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    console.log("Drag started for item with id:", active.id) // ログ出力
    setActiveItem(props.items.find((item) => item.id === active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeItem = props.items.find((item) => item.id === active.id)
    const overItem = props.items.find((item) => item.id === over.id)

    if (!activeItem || !overItem) {
      return
    }

    const activeIndex = props.items.findIndex((item) => item.id === active.id)
    const overIndex = props.items.findIndex((item) => item.id === over.id)
    const newItems =
      activeIndex !== overIndex
        ? arrayMove<TSortableItem>(props.items, activeIndex, overIndex)
        : props.items
    setActiveItem(undefined)
    props.setItems(
      newItems.map((item, index) => ({
        ...item,
        id: index,
      })),
    )
    // インデックス並び替え
    changeIndexList(activeIndex, overIndex)
  }

  const changeIndexList = (activeIndex: number, overIndex: number) => {
    const newIds = props.items
      .map((item) => item.id)
      .map((id) => {
        if (id === activeIndex) {
          return overIndex
        }
        if (id === overIndex) {
          return activeIndex
        }
        return id
      })
    props.setIndexList(newIds)
  }

  const deleteIndex = (deletedId: number) => {
    console.log("deletedId", deletedId)

    // deletedId以降は1つずつ前にずらす
    props.setIndexList((prev) =>
      prev
        .filter((id) => id !== deletedId)
        .map((id) => (id > deletedId ? id - 1 : id)),
    )

    // itemsの各itemsのidを今の並び順ごとに0, 1, 2...と振り直す
    const newItems = props.items.filter((item) => item.id !== deletedId)
    props.setItems(
      newItems.map((item, index) => ({
        ...item,
        id: index,
      })),
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={undefined}
    >
      <SortableContext items={props.items} strategy={rectSortingStrategy}>
        <div className="flex w-full flex-wrap justify-center gap-4">
          {props.items.map((item) => (
            <SortableItem
              onDelete={deleteIndex}
              isDeletable={props.isDeletable}
              key={item.id}
              item={item}
              optionalButton={props.optionalButton}
              onClickOptionButton={props.onClickOptionButton}
            />
          ))}
          {props.dummyEnableDragItem && <div>{props.dummyEnableDragItem}</div>}
        </div>
      </SortableContext>
      <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
        {activeItem ? <ImageItem item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
