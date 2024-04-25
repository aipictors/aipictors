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
import { useState } from "react"
import ImageItem from "@/_components/drag/image-item"
import SortableItem from "@/_components/drag/sortable-item"

type Props = {
  items: TSortableItem[]
  setItems: React.Dispatch<React.SetStateAction<TSortableItem[]>>
  setIndexList: React.Dispatch<React.SetStateAction<number[]>>
  isDeletable?: boolean
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
    changeIndex()
  }

  const handleDragCancel = () => {
    setActiveItem(undefined)
  }

  const changeIndex = () => {
    const itemIds = props.items.map((item) => item.id)
    props.setIndexList(itemIds)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={props.items} strategy={rectSortingStrategy}>
        <div className="flex w-full flex-wrap justify-center gap-4">
          {props.items.map((item) => (
            <SortableItem
              onDelete={(id: number) => {
                props.setItems((prev) => prev.filter((item) => item.id !== id))
                changeIndex()
              }}
              isDeletable={true}
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
        {activeItem ? <ImageItem item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
