import {
  type CollisionDetection,
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  defaultDropAnimationSideEffects,
  MouseSensor,
  pointerWithin,
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
import {
  renumberSortableItems,
  toSortableKey,
} from "~/components/drag/sortable-key"

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
  /** 画像の下に出す小さな表示 */
  renderItemFooter?: (item: TSortableItem) => React.ReactNode
  /** 1 枚の大きさ（px） */
  itemSize?: number
  /** サムネを切り抜かずに画像全体を見せる（元の比率） */
  isOriginalRatio?: boolean
  /**
   * 並べ替えモード。画像のどこを触ってもすぐ動かせ、◀ ▶ で 1 つずつ動かせる
   * （外す・直す・差し替えのボタンは隠す）
   */
  isReorderMode?: boolean
}

/** 並びを確定する（id は並びに合わせて振り直す） */
export const commitSortableOrder = (
  moved: TSortableItem[],
  setIndexList: (value: number[]) => void,
  setItems: (items: TSortableItem[]) => void,
) => {
  setIndexList(moved.map((item) => item.id))
  setItems(renumberSortableItems(moved))
}

/**
 * 指の下にある画像を置き先にする。画像のすき間では一番近い画像にする
 * （近さだけで決めると、少し動かすたびに置き先が変わって周りが動き回る）
 */
const collisionDetection: CollisionDetection = (args) => {
  const within = pointerWithin(args)
  return within.length > 0 ? within : closestCenter(args)
}

/** 離したとき、持っている画像を置いた場所へ短く収める */
const dropAnimation: DropAnimation = {
  duration: 180,
  easing: "cubic-bezier(0.2, 0, 0, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0" } },
  }),
}

/**
 * 指定された要素をドラッグで並び替えできるようにする
 * - 動かしている間は見た目（transform）だけ動かし、離したときに 1 回だけ並びを確定する
 *   （前は指が他の画像に重なるたびに投稿フォーム全体と下書きの保存が走って重かった）
 * - ドラッグの id は並べ替えても変わらない目印（sortKey）。id は並びで振り直すので使わない
 * - ふだんは画像の上でもスクロールでき、スマートフォンは長押し、PC は 5px 動かすと持ち上げる
 * - 並べ替えモードでは、触ってすぐ持ち上げる（スクロールは画像の外で）
 */
export function SortableItems(props: Props): React.ReactNode {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const isReorderMode = props.isReorderMode ?? false

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: isReorderMode
        ? { distance: 4 }
        : { delay: 300, tolerance: 6 },
    }),
  )

  // 子に渡す関数を毎回作り直さない（画像の数が多いと描き直しが重い）
  const latest = useRef(props)
  latest.current = props

  const handleDragStart = (event: DragStartEvent) => {
    setActiveKey(String(event.active.id))
    // 持ち上げたことが分かるように短く震わせる（対応している端末だけ）
    navigator.vibrate?.(10)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveKey(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeIndex = props.items.findIndex(
      (item) => toSortableKey(item) === active.id,
    )
    const overIndex = props.items.findIndex(
      (item) => toSortableKey(item) === over.id,
    )
    if (activeIndex === -1 || overIndex === -1) return

    commitSortableOrder(
      arrayMove(props.items, activeIndex, overIndex),
      props.setIndexList,
      props.setItems,
    )
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
      renumberSortableItems(items.filter((item) => item.id !== deletedId)),
    )
  }, [])

  /** 1 つ前・後ろへ動かす（並べ替えモードの ◀ ▶） */
  const moveItem = useCallback((id: number, offset: -1 | 1) => {
    const { items, setIndexList, setItems } = latest.current
    const index = items.findIndex((item) => item.id === id)
    const nextIndex = index + offset
    if (index === -1 || nextIndex < 0 || nextIndex >= items.length) return
    commitSortableOrder(
      arrayMove(items, index, nextIndex),
      setIndexList,
      setItems,
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
    activeKey === null
      ? undefined
      : props.items.find((item) => toSortableKey(item) === activeKey)

  const itemSize = props.itemSize ?? 112
  // まだ並べ替えていない画像が（モザイクなどで）作り直されたら、同じ場所・同じ id の目印を引き継ぐ
  const previousKeys = useRef<{ id: number; key: string }[]>([])
  const sortableKeys = props.items.map((item, index) => {
    const previous = previousKeys.current[index]
    return toSortableKey(
      item,
      previous?.id === item.id ? previous.key : undefined,
    )
  })
  previousKeys.current = props.items.map((item, index) => ({
    id: item.id,
    key: sortableKeys[index],
  }))

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveKey(null)}
    >
      <SortableContext items={sortableKeys} strategy={rectSortingStrategy}>
        {/* 1 枚の大きさから列の数を決め、列の幅いっぱいに並べる。下には指を置ける余白を残す */}
        <div
          className="grid w-full gap-2 px-2 pt-2 pb-6 md:gap-3"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${itemSize}px, 1fr))`,
          }}
        >
          {props.items.map((item, index) => (
            <SortableItem
              key={sortableKeys[index]}
              item={item}
              sortKey={sortableKeys[index]}
              size={itemSize}
              isOriginalRatio={props.isOriginalRatio}
              position={props.items.length > 1 ? index + 1 : undefined}
              isReorderMode={isReorderMode}
              isFirst={index === 0}
              isLast={index === props.items.length - 1}
              onMove={moveItem}
              onRenameFile={props.isFileNameEditable ? renameFile : undefined}
              onReplace={props.onReplace ? replace : undefined}
              isDeletable={props.isDeletable}
              onDelete={deleteItem}
              optionalButton={props.optionalButton}
              optionalButtonLabel={props.optionalButtonLabel}
              onClickOptionButton={clickOption}
              footer={props.renderItemFooter?.(item)}
            />
          ))}
          {props.dummyEnableDragItem && !isReorderMode && (
            <div className="aspect-square">{props.dummyEnableDragItem}</div>
          )}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem ? (
          <ImageItem
            item={activeItem}
            size={itemSize}
            isOriginalRatio={props.isOriginalRatio}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
