import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
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
import type { TSortableItem } from "~/components/drag/sortable-item"
import type React from "react"
import { useState } from "react"
import { ImageItem } from "~/components/drag/image-item"
import { SortableItem } from "~/components/drag/sortable-item"

type Props = {
  items: TSortableItem[]
  setItems: (items: TSortableItem[]) => void
  setIndexList: (value: number[]) => void
  isDeletable?: boolean
  optionalButton?: React.ReactNode
  onClickOptionButton?: (id: number) => void
  dummyEnableDragItem?: React.ReactNode // アイテム一覧に並び替えできないダミーアイテム
}

/**
 * 指定された要素をドラッグで並び替えできるようにする
 */
export function SortableItems (props: Props): React.ReactNode {
  const [activeItem, setActiveItem] = useState<TSortableItem>()
  const [isDragging, setIsDragging] = useState(false)

  // TouchSensor を優先して長押し／スワイプでドラッグ開始できるように
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 長押し 150ms 後にドラッグ開始
        tolerance: 5, // 5px 移動でドラッグ開始
      },
    }),
    useSensor(PointerSensor),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveItem(props.items.find((item) => item.id === active.id))
    setIsDragging(true)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeIndex = props.items.findIndex((item) => item.id === active.id)
    const overIndex = props.items.findIndex((item) => item.id === over.id)

    if (activeIndex !== overIndex) {
      const newItems = arrayMove(props.items, activeIndex, overIndex)
      props.setItems(newItems)
      props.setIndexList(newItems.map((item) => item.id))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeIndex = props.items.findIndex((item) => item.id === active.id)
    const overIndex = props.items.findIndex((item) => item.id === over.id)
    const newItems =
      activeIndex !== overIndex
        ? arrayMove<TSortableItem>(props.items, activeIndex, overIndex)
        : props.items

    setActiveItem(undefined)
    setIsDragging(false)

    // アイテムの id をインデックスに合わせて振り直し
    props.setItems(
      newItems.map((item, index) => ({
        ...item,
        id: index,
      })),
    )
    changeIndexList(activeIndex, overIndex)
  }

  const changeIndexList = (activeIndex: number, overIndex: number) => {
    const newIds = props.items
      .map((item) => item.id)
      .map((id) => {
        if (id === activeIndex) return overIndex
        if (id === overIndex) return activeIndex
        return id
      })
    props.setIndexList(newIds)
  }

  const deleteIndex = (deletedId: number) => {
    // deletedId 以降はひとつ前に詰める
    const draftIds = props.items
      .map((item) => item.id)
      .filter((id) => id !== deletedId)
      .map((id) => (id > deletedId ? id - 1 : id))
    props.setIndexList(draftIds)

    // items の各 id を振り直す
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
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={props.items} strategy={rectSortingStrategy}>
        <div className="flex w-full flex-wrap justify-center gap-4">
          {props.items.map((item) => (
            <SortableItem
              key={item.id}
              className="touch-none" // タッチアクションを無効化
              item={item}
              isDeletable={props.isDeletable}
              onDelete={deleteIndex}
              optionalButton={props.optionalButton}
              onClickOptionButton={props.onClickOptionButton}
            />
          ))}
          {props.dummyEnableDragItem && <div>{props.dummyEnableDragItem}</div>}
        </div>
      </SortableContext>

      {isDragging && (
        <DragOverlay adjustScale style={{ transformOrigin: "0 0" }}>
          {activeItem ? <ImageItem item={activeItem} isDragging /> : null}
        </DragOverlay>
      )}
    </DndContext>
  )
}
