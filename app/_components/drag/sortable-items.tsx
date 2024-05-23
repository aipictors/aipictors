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
  setItems: React.Dispatch<React.SetStateAction<TSortableItem[]>>
  setIndexList: (indexList: number[]) => void
  isDeletable?: boolean
  onDelete?: (id: number) => void
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

    if (activeIndex !== overIndex) {
      props.setItems((prev) =>
        arrayMove<TSortableItem>(prev, activeIndex, overIndex),
      )
    }
    setActiveItem(undefined)

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

  const deleteIndex = (deleteId: number) => {
    // 以降を-1する
    const newIds = props.items
      .filter((item) => item.id !== deleteId)
      .map((item) => item.id)
      .map((id) => (id > deleteId ? id - 1 : id))
    props.setIndexList(newIds)
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
              onDelete={(id: number) => {
                props.setItems((prev) => prev.filter((item) => item.id !== id))
                deleteIndex(id)
                if (props.onDelete) {
                  props.onDelete(id)
                }
              }}
              isDeletable={true}
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
