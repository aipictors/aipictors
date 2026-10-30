import { useQuery } from "@apollo/client/index"
// ----- dnd-kit -----
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
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type FragmentOf, graphql } from "gql.tada"
import {
  GripVerticalIcon,
  ImageIcon,
  ImagesIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { AlbumWorkLimitUpgradeDialog } from "~/routes/($lang).my._index/components/album-work-limit-upgrade-dialog"
import {
  type AlbumWorkLimitPassType,
  getAlbumWorksLimitUpgradeTarget,
} from "~/utils/album-work-limit"

type Props = {
  selectedWorkIds: string[]
  setSelectedWorkIds: React.Dispatch<React.SetStateAction<string[]>>
  limit?: number
  currentAlbumId?: string
  currentPassType?: AlbumWorkLimitPassType
}

type SortableItemProps = {
  work: FragmentOf<typeof DialogWorkFragment>
  selectedWorkIds: string[]
  setSelectedWorkIds: React.Dispatch<React.SetStateAction<string[]>>
  isInOtherAlbum: boolean
  order: number
}

function SortableItem(props: SortableItemProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.work.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const removeWork = () => {
    props.setSelectedWorkIds((currentIds) => {
      return currentIds.filter((id) => id !== props.work.id)
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border bg-card p-2 pr-1 shadow-sm"
    >
      <span className="w-6 shrink-0 text-center font-semibold text-muted-foreground text-sm tabular-nums">
        {props.order}
      </span>
      <img
        className="size-16 rounded-lg object-cover sm:size-20"
        src={props.work.smallThumbnailImageURL}
        alt=""
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-medium text-sm">{props.work.title}</p>
        {props.isInOtherAlbum && (
          <p className="mt-1 text-amber-600 text-xs">他シリーズにも登録済み</p>
        )}
      </div>
      <div className="flex items-center gap-1 self-stretch">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0"
          onClick={removeWork}
          aria-label="作品を選択解除"
        >
          <XIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 cursor-grab touch-none"
          ref={setActivatorNodeRef}
          aria-label="作品を並び替え"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-5" />
        </Button>
      </div>
    </div>
  )
}

/**
 * 作成済みの作品選択ダイアログ
 */
export function SelectCreatedWorksDialogWithIds(props: Props) {
  const t = useTranslation()
  const appContext = useContext(AuthContext)

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [page, setPage] = useState(0) // "未選択"タブ用ページ
  const [selectedPage, setSelectedPage] = useState(0) // "選択中"タブ用ページ
  const [tab, setTab] = useState<"NO_SELECTED" | "SELECTED">("NO_SELECTED")
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [selectedWorksCache, setSelectedWorksCache] = useState<
    Record<string, FragmentOf<typeof DialogWorkFragment>>
  >({})

  // ======== 未選択タブ用クエリ (全作品 + ページング) ========
  const worksResult = useQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        userId: appContext.userId,
        orderBy: "DATE_CREATED",
        sort: "DESC",
      },
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })
  const { refetch: refetchWorks } = worksResult
  const works = worksResult.data?.works ?? []

  // ======== 全作品数 (未選択タブのページネーション) ========
  const worksCountResp = useQuery(worksCountQuery, {
    skip: appContext.isLoading,
    variables: {
      where: {
        userId: appContext.userId,
      },
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })
  const { refetch: refetchWorksCount } = worksCountResp
  const worksMaxCount = worksCountResp.data?.worksCount ?? 0

  // ======== 選択中タブ用クエリ (selectedWorkIds に合致する作品) ========
  const selectedWorksResult = useQuery(worksQuery, {
    skip: appContext.isLoading || props.selectedWorkIds.length === 0,
    variables: {
      offset: selectedPage * 32,
      limit: 32,
      where: {
        ids: props.selectedWorkIds,
        orderBy: "DATE_CREATED",
        sort: "DESC",
      },
    },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    returnPartialData: true,
  })
  const { refetch: refetchSelectedWorks } = selectedWorksResult

  const selectedWorksQueryData = selectedWorksResult.data?.works ?? []

  // ======== 選択中タブの作品総数 (ページネーション) ========
  const selectedWorksCountResp = useQuery(worksCountQuery, {
    skip: appContext.isLoading || props.selectedWorkIds.length === 0,
    variables: {
      where: {
        ids: props.selectedWorkIds,
      },
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })
  const { refetch: refetchSelectedWorksCount } = selectedWorksCountResp

  useEffect(() => {
    if (!isOpen) {
      return
    }

    refetchWorks().catch(() => undefined)
    refetchWorksCount().catch(() => undefined)

    if (props.selectedWorkIds.length > 0) {
      refetchSelectedWorks().catch(() => undefined)
      refetchSelectedWorksCount().catch(() => undefined)
    }
  }, [
    isOpen,
    props.selectedWorkIds.length,
    refetchSelectedWorks,
    refetchSelectedWorksCount,
    refetchWorks,
    refetchWorksCount,
  ])

  useEffect(() => {
    if (selectedWorksQueryData.length === 0) {
      return
    }

    setSelectedWorksCache((prev) => {
      const next = { ...prev }

      for (const work of selectedWorksQueryData) {
        next[work.id] = work
      }

      return next
    })
  }, [selectedWorksQueryData])

  const selectedWorksMaxCount = selectedWorksCountResp.data?.worksCount ?? 0

  // ======== (未選択タブ) 作品クリック ========
  const handleWorkClick = (work: FragmentOf<typeof DialogWorkFragment>) => {
    props.setSelectedWorkIds((currentIds) => {
      if (currentIds.includes(work.id)) {
        return currentIds.filter((id) => id !== work.id)
      }

      if (!props.limit || currentIds.length < props.limit) {
        return [...currentIds, work.id]
      }

      toast(
        t(
          `選択できる作品数は${props.limit}つまでです。`,
          `You can select up to ${props.limit} works.`,
        ),
      )

      if (getAlbumWorksLimitUpgradeTarget(props.currentPassType)) {
        setIsUpgradeDialogOpen(true)
      }

      return currentIds
    })
  }

  const nextUpgrade = getAlbumWorksLimitUpgradeTarget(props.currentPassType)

  // ======== 「選択中」タブで表示する作品を ID の順番に並び替えた配列を生成 ========
  // DnD などで並び順を変更するときは、props.selectedWorkIds こそが順序のソースになる想定。
  const sortedSelectedWorks = props.selectedWorkIds
    .map(
      (id) =>
        selectedWorksCache[id] ??
        selectedWorksQueryData.find((w) => w.id === id),
    )
    .filter(Boolean) as FragmentOf<typeof DialogWorkFragment>[]

  // ======== 作品一覧タブの描画 ========
  const renderWorks = (
    worksToRender: FragmentOf<typeof DialogWorkFragment>[],
  ) => {
    return (
      <div className="grid grid-cols-3 gap-2 pb-2 sm:grid-cols-5 md:grid-cols-6">
        {worksToRender.map((work) => {
          const order = props.selectedWorkIds.indexOf(work.id)
          const isSelected = order !== -1
          const isInOtherAlbum =
            Boolean(work.album) && work.album?.id !== props.currentAlbumId
          return (
            <button
              key={work.id}
              type="button"
              className={cn(
                "group relative aspect-square touch-manipulation overflow-hidden rounded-lg bg-muted text-left outline-none ring-offset-2 ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && "ring-2 ring-primary",
              )}
              onClick={() => handleWorkClick(work)}
              aria-pressed={isSelected}
              aria-label={work.title}
            >
              <img
                className={cn(
                  "size-full object-cover transition",
                  isSelected ? "opacity-80" : "group-hover:opacity-90",
                )}
                src={work.smallThumbnailImageURL}
                alt=""
                loading="lazy"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-4 pb-1 text-white text-xs">
                <span className="line-clamp-1">{work.title}</span>
              </span>
              <span
                className={cn(
                  "absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full border-2 font-semibold text-xs shadow-sm",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/90 bg-black/20",
                )}
              >
                {isSelected ? order + 1 : null}
              </span>
              {isInOtherAlbum && (
                <span className="absolute top-1.5 right-1.5 rounded bg-background/90 px-1 py-0.5 text-[10px] text-foreground shadow-sm">
                  {t("他シリーズ", "Other series")}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // ========== ドラッグ＆ドロップ関連 (SELECTED タブ) ==========
  const [activeDragItem, setActiveDragItem] = useState<FragmentOf<
    typeof DialogWorkFragment
  > | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    }),
  )

  // ドラッグ開始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const found = sortedSelectedWorks.find((w) => w.id === active.id)
    if (found) {
      setActiveDragItem(found)
    }
  }

  // ドラッグ終了
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) {
      setActiveDragItem(null)
      return
    }
    if (active.id !== over.id) {
      const oldIndex = props.selectedWorkIds.indexOf(active.id.toString())
      const newIndex = props.selectedWorkIds.indexOf(over.id.toString())
      // 並び替え
      if (oldIndex !== -1 && newIndex !== -1) {
        const newIds = arrayMove(props.selectedWorkIds, oldIndex, newIndex)
        props.setSelectedWorkIds(newIds)
      }
    }
    setActiveDragItem(null)
  }

  // 選択中タブの描画
  const renderSelectedWorksDnD = () => {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={props.selectedWorkIds} // 順番どおりに
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 pb-2">
            {sortedSelectedWorks.map((work, index) => {
              const isInOtherAlbum =
                Boolean(work.album) && work.album?.id !== props.currentAlbumId

              return (
                <SortableItem
                  key={work.id}
                  work={work}
                  selectedWorkIds={props.selectedWorkIds}
                  setSelectedWorkIds={props.setSelectedWorkIds}
                  isInOtherAlbum={isInOtherAlbum}
                  order={index + 1}
                />
              )
            })}
          </div>
        </SortableContext>

        <DragOverlay adjustScale={false} style={{ transformOrigin: "0 0 " }}>
          {activeDragItem && (
            <div className="flex w-[min(100vw-2rem,32rem)] items-center gap-3 rounded-xl border bg-background p-3 shadow-lg">
              <img
                className="size-20 rounded-lg object-cover"
                src={activeDragItem.smallThumbnailImageURL}
                alt=""
              />
              <p className="line-clamp-2 font-medium text-sm">
                {activeDragItem.title}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    )
  }

  const openPicker = () => {
    setTab(props.selectedWorkIds.length > 0 ? "SELECTED" : "NO_SELECTED")
    setIsOpen(true)
  }

  // ダイアログの外（フォームの中）に出す、選んだ作品の一覧
  const PREVIEW_COUNT = 11
  const previewWorks = sortedSelectedWorks.slice(0, PREVIEW_COUNT)
  const hiddenCount = props.selectedWorkIds.length - previewWorks.length

  return (
    <>
      {props.selectedWorkIds.length === 0 ? (
        <button
          type="button"
          onClick={openPicker}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
        >
          <ImagesIcon className="size-7" />
          <span className="font-medium text-foreground text-sm">
            {t("作品を選ぶ", "Select works")}
          </span>
          <span className="text-xs">
            {t(
              "投稿済みの作品から、シリーズに入れる作品を選びます",
              "Choose works from your posts",
            )}
          </span>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {previewWorks.map((work, index) => (
              <div
                key={work.id}
                className="relative aspect-square overflow-hidden rounded-md bg-muted"
              >
                <img
                  className="size-full object-cover"
                  src={work.smallThumbnailImageURL}
                  alt={work.title}
                />
                <span className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full bg-black/60 font-semibold text-[10px] text-white">
                  {index + 1}
                </span>
              </div>
            ))}
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={openPicker}
                className="flex aspect-square items-center justify-center rounded-md bg-muted font-semibold text-muted-foreground text-sm hover:bg-muted/70"
              >
                +{hiddenCount}
              </button>
            )}
            {hiddenCount <= 0 && (
              <button
                type="button"
                onClick={openPicker}
                className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border-2 border-dashed text-muted-foreground text-xs hover:border-primary/50 hover:text-foreground"
                aria-label={t("作品を追加", "Add works")}
              >
                <PlusIcon className="size-5" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={openPicker}
          >
            {t("作品の追加・並び替え", "Add or reorder works")}
          </Button>
        </div>
      )}

      {/* ダイアログ */}
      <Dialog open={isOpen} onOpenChange={(opened) => setIsOpen(opened)}>
        <DialogContent className="flex max-h-[90svh] w-[calc(100vw-1rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
          <DialogHeader className="shrink-0 space-y-3 border-b px-4 pt-4 pr-12 pb-3 text-left sm:px-6">
            <DialogTitle>{t("作品を選ぶ", "Select works")}</DialogTitle>
            <Tabs
              value={tab}
              onValueChange={(value) =>
                setTab(value as "NO_SELECTED" | "SELECTED")
              }
            >
              <TabsList className="grid w-full grid-cols-2 sm:w-80">
                <TabsTrigger value="NO_SELECTED">
                  {t("作品一覧", "All works")}
                </TabsTrigger>
                <TabsTrigger value="SELECTED">
                  {t("選択中・並び順", "Selected")}
                  <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-primary text-xs tabular-nums">
                    {props.selectedWorkIds.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </DialogHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6">
            {tab === "NO_SELECTED" &&
              (works.length > 0 ? (
                <>
                  <p className="mb-2 text-muted-foreground text-xs">
                    {t(
                      "タップした順番がシリーズの並び順になります。もう一度タップすると選択を外せます。",
                      "Tap works in the order you want. Tap again to deselect.",
                    )}
                  </p>
                  {renderWorks(works)}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground text-sm">
                  <ImageIcon className="size-8 opacity-70" />
                  {worksResult.loading
                    ? t("読み込み中…", "Loading…")
                    : t(
                        "まだ投稿した作品がありません。作品を投稿してからシリーズを作れます。",
                        "No works yet. Post works first to create a series.",
                      )}
                </div>
              ))}
            {tab === "SELECTED" && (
              <>
                <p className="mb-3 text-muted-foreground text-xs">
                  {t(
                    "右の持ち手をドラッグ（スマホは長押し）して並び替えると、その順番でシリーズに並びます。",
                    "Drag the handle to reorder. This order is used in the series.",
                  )}
                </p>
                {sortedSelectedWorks.length > 0 ? (
                  renderSelectedWorksDnD()
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                    {t(
                      "まだ選んでいません。「作品一覧」から選んでください。",
                      "Nothing selected yet. Pick works from All works.",
                    )}
                  </div>
                )}
              </>
            )}
          </ScrollArea>

          <div className="shrink-0 space-y-3 border-t px-4 py-3 sm:px-6">
            {tab === "NO_SELECTED" && worksMaxCount > 32 && (
              <ResponsivePagination
                perPage={32}
                maxCount={worksMaxCount}
                currentPage={page}
                onPageChange={(p: number) => setPage(p)}
              />
            )}
            {tab === "SELECTED" && selectedWorksMaxCount > 32 && (
              <ResponsivePagination
                perPage={32}
                maxCount={selectedWorksMaxCount}
                currentPage={selectedPage}
                onPageChange={(p: number) => setSelectedPage(p)}
              />
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 text-sm">
                <span className="font-semibold tabular-nums">
                  {props.selectedWorkIds.length}
                </span>
                {props.limit !== undefined && (
                  <span className="text-muted-foreground tabular-nums">
                    {" "}
                    / {props.limit}
                  </span>
                )}
                <span className="text-muted-foreground">
                  {t(" 作品を選択中", " selected")}
                </span>
                {nextUpgrade &&
                  props.limit !== undefined &&
                  props.selectedWorkIds.length >= props.limit && (
                    <button
                      type="button"
                      className="ml-2 font-medium text-primary text-xs underline-offset-4 hover:underline"
                      onClick={() => setIsUpgradeDialogOpen(true)}
                    >
                      {t("上限を増やす", "Raise the limit")}
                    </button>
                  )}
              </div>
              <Button
                type="button"
                className="shrink-0"
                onClick={() => setIsOpen(false)}
              >
                {t("完了", "Done")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlbumWorkLimitUpgradeDialog
        currentPassType={props.currentPassType}
        open={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
      />
    </>
  )
}

// ==== GraphQL Fragment ====
// 作品サムネ・タイトル用のフラグメント
export const DialogWorkFragment = graphql(`
  fragment DialogWork on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
    album {
      id
      title
    }
  }
`)

// ==== GraphQL Queries ====
// 総数取得 (任意の where 条件に対応)
const worksCountQuery = graphql(`
  query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }
`)

// ページング付き作品一覧取得 (任意の where 条件に対応)
const worksQuery = graphql(
  `
    query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
      works(offset: $offset, limit: $limit, where: $where) {
        ...DialogWork
      }
    }
  `,
  [DialogWorkFragment],
)
