import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable"
import type React from "react"
import { useCallback, useRef, useState } from "react"
import { ImageItem } from "~/components/drag/image-item"
import type { TSortableItem } from "~/components/drag/sortable-item"
import { SortableItem } from "~/components/drag/sortable-item"

type Props = {
  items: TSortableItem[]
  setItems: (items: TSortableItem[]) => void
  setIndexList: (value: number[]) => void
  isDeletable?: boolean
  /** ファイル名を押して変えられるようにする */
  isFileNameEditable?: boolean
  /** 画像ごとの差し替えボタンを押したとき */
  onReplace?: (id: number) => void
  /** 左下のボタンの中身（アイコン） */
  optionalButton?: React.ReactNode
  optionalButtonLabel?: string
  /** 左下のボタンを押したとき（何枚目か） */
  onClickOptionButton?: (index: number) => void
  dummyEnableDragItem?: React.ReactNode // アイテム一覧に並び替えできないダミーアイテム
}

/**
 * 指定された要素をドラッグで並び替えできるようにする
 * - 動かしている間は見た目（transform）だけ動かし、離したときに 1 回だけ並びを確定する
 *   （前は指が他の画像に重なるたびに投稿フォーム全体と下書きの保存が走って重かった）
 * - スマートフォンは長押しで持ち上げる（そのままスクロールもできる）。PC は 5px 動かすと持ち上げる
 */
export function SortableItems(props: Props): React.ReactNode {
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
  )

  // 子に渡す関数を毎回作り直さない（画像の数が多いと描き直しが重い）
  const latest = useRef(props)
  latest.current = props

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeIndex = props.items.findIndex((item) => item.id === active.id)
    const overIndex = props.items.findIndex((item) => item.id === over.id)
    if (activeIndex === -1 || overIndex === -1) return

    const moved = arrayMove(props.items, activeIndex, overIndex)
    props.setIndexList(moved.map((item) => item.id))
    // アイテムの id を並び順に振り直す
    props.setItems(moved.map((item, index) => ({ ...item, id: index })))
  }

  const deleteItem = useCallback((deletedId: number) => {
    const { items, setIndexList, setItems } = latest.current
    // deletedId 以降はひとつ前に詰める
    setIndexList(
      items
        .map((item) => item.id)
        .filter((id) => id !== deletedId)
        .map((id) => (id > deletedId ? id - 1 : id)),
    )
    setItems(
      items
        .filter((item) => item.id !== deletedId)
        .map((item, index) => ({ ...item, id: index })),
    )
  }, [])

  const renameFile = useCallback((id: number, fileName: string) => {
    const { items, setItems } = latest.current
    setItems(
      items.map((current) =>
        current.id === id ? { ...current, fileName } : current,
      ),
    )
  }, [])

  const replace = useCallback((id: number) => {
    latest.current.onReplace?.(id)
  }, [])

  const clickOption = useCallback((id: number) => {
    const index = latest.current.items.findIndex((item) => item.id === id)
    if (index !== -1) latest.current.onClickOptionButton?.(index)
  }, [])

  const activeItem =
    activeId === null
      ? undefined
      : props.items.find((item) => item.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={props.items} strategy={rectSortingStrategy}>
        <div className="flex w-full flex-wrap justify-center gap-3 md:gap-4">
          {props.items.map((item, index) => (
            <SortableItem
              key={item.id}
              item={item}
              position={props.items.length > 1 ? index + 1 : undefined}
              onRenameFile={props.isFileNameEditable ? renameFile : undefined}
              onReplace={props.onReplace ? replace : undefined}
              isDeletable={props.isDeletable}
              onDelete={deleteItem}
              optionalButton={props.optionalButton}
              optionalButtonLabel={props.optionalButtonLabel}
              onClickOptionButton={clickOption}
            />
          ))}
          {props.dummyEnableDragItem && <div>{props.dummyEnableDragItem}</div>}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? <ImageItem item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
