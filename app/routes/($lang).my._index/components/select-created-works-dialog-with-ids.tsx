import { useContext, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { ImageIcon, CheckIcon, PlusIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ScrollArea } from "~/components/ui/scroll-area"
import { type FragmentOf, graphql } from "gql.tada"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

// ----- dnd-kit -----
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Props = {
  selectedWorkIds: string[]
  setSelectedWorkIds: (workIds: string[]) => void
  limit?: number
}

type SortableItemProps = {
  work: FragmentOf<typeof DialogWorkFragment>
  isDragMode: boolean
  selectedWorkIds: string[]
  setSelectedWorkIds: (workIds: string[]) => void
  truncateTitle: (title: string, maxLength: number) => string
}

function SortableItem(props: SortableItemProps) {
  // drag/drop の動作管理
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.work.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // 「並び替えモード」でないときはクリックで"選択解除"
      onClick={
        !props.isDragMode
          ? () => {
              const newIds = props.selectedWorkIds.filter(
                (id) => id !== props.work.id,
              )
              props.setSelectedWorkIds(newIds)
            }
          : undefined
      }
      className={
        props.isDragMode
          ? "relative m-2 cursor-grab bg-transparent p-0" // 並び替えON: grabカーソル
          : "relative m-2 cursor-pointer bg-transparent p-0" // 並び替えOFF: クリック解除用
      }
    >
      <img
        className="size-24 rounded-md object-cover"
        src={props.work.smallThumbnailImageURL}
        alt=""
      />
      <div className="absolute bottom-0 bg-gray-800 bg-opacity-50 text-white text-xs">
        {props.truncateTitle(props.work.title, 8)}
      </div>
    </button>
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

  // 並び替えトグル (true でドラッグモード)
  const [isDragMode, setIsDragMode] = useState(false)

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
  })
  const works = worksResult.data?.works ?? []

  // ======== 全作品数 (未選択タブのページネーション) ========
  const worksCountResp = useQuery(worksCountQuery, {
    skip: appContext.isLoading,
    variables: {
      where: {
        userId: appContext.userId,
      },
    },
  })
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
  })

  const selectedWorksQueryData = selectedWorksResult.data?.works ?? []

  // ======== 選択中タブの作品総数 (ページネーション) ========
  const selectedWorksCountResp = useQuery(worksCountQuery, {
    skip: appContext.isLoading || props.selectedWorkIds.length === 0,
    variables: {
      where: {
        ids: props.selectedWorkIds,
      },
    },
  })
  const selectedWorksMaxCount = selectedWorksCountResp.data?.worksCount ?? 0

  // ======== タイトルを省略するヘルパー ========
  const truncateTitle = (title: string, maxLength: number) =>
    title.length > maxLength ? `${title.slice(0, maxLength)}...` : title

  // ======== (未選択タブ) 作品クリック ========
  const handleWorkClick = (work: FragmentOf<typeof DialogWorkFragment>) => {
    const isAlreadySelected = props.selectedWorkIds.includes(work.id)
    if (isAlreadySelected) {
      // 選択解除
      const newIds = props.selectedWorkIds.filter((id) => id !== work.id)
      props.setSelectedWorkIds(newIds)
    } else {
      // 新規選択
      if (!props.limit || props.selectedWorkIds.length < props.limit) {
        const newIds = [...props.selectedWorkIds, work.id]
        props.setSelectedWorkIds(newIds)
      } else {
        toast(
          t(
            `選択できる作品数は${props.limit}つまでです。`,
            `You can select up to ${props.limit} works.`,
          ),
        )
      }
    }
  }

  // ======== 「選択中」タブで表示する作品を ID の順番に並び替えた配列を生成 ========
  // DnD などで並び順を変更するときは、props.selectedWorkIds こそが順序のソースになる想定。
  const sortedSelectedWorks = props.selectedWorkIds
    .map((id) => selectedWorksQueryData.find((w) => w.id === id))
    .filter(Boolean) as FragmentOf<typeof DialogWorkFragment>[]

  // ======== 未選択タブの描画 ========
  const renderWorks = (
    worksToRender: FragmentOf<typeof DialogWorkFragment>[],
  ) => {
    return worksToRender.map((work) => (
      <div key={work.id}>
        <button
          type="button"
          className="relative m-2 size-24 cursor-pointer bg-transparent p-0"
          onClick={() => handleWorkClick(work)}
        >
          <img
            className="size-24 rounded-md object-cover"
            src={work.smallThumbnailImageURL}
            alt=""
          />
          <div className="absolute bottom-0 bg-gray-800 bg-opacity-50 text-white text-xs">
            {truncateTitle(work.title, 8)}
          </div>
          {/* 選択済みだったらチェックアイコン */}
          {props.selectedWorkIds.includes(work.id) && (
            <div className="absolute top-1 left-1 rounded-full border-2 bg-black dark:bg-white">
              <CheckIcon className="p-1 text-white dark:text-black" />
            </div>
          )}
        </button>
      </div>
    ))
  }

  // ========== ドラッグ＆ドロップ関連 (SELECTED タブ) ==========
  const [activeDragItem, setActiveDragItem] = useState<FragmentOf<
    typeof DialogWorkFragment
  > | null>(null)

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))

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
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap">
            {sortedSelectedWorks.map((work) => (
              <SortableItem
                key={work.id}
                work={work}
                isDragMode={isDragMode}
                selectedWorkIds={props.selectedWorkIds}
                setSelectedWorkIds={props.setSelectedWorkIds}
                truncateTitle={truncateTitle}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay adjustScale={false} style={{ transformOrigin: "0 0 " }}>
          {activeDragItem && (
            <div className="size-24 border border-gray-300">
              <img
                className="h-full w-full object-cover"
                src={activeDragItem.smallThumbnailImageURL}
                alt=""
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    )
  }

  // もし未選択タブで作品が全くない場合 (かつ、タブもNO_SELECTED) の例
  if (!works?.length && tab === "NO_SELECTED") {
    return (
      <div className="p-4">
        <ImageIcon className="m-auto size-8 opacity-70" />
        <p className="p-4 text-center text-sm">
          {t("作品がありません。", "No works available.")}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* 「すべて見る」リンク：選択中が7件を超えたら表示例 */}
      {props.selectedWorkIds.length > 7 && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="m-2 w-full cursor-pointer bg-transparent p-0 text-right text-sm opacity-80"
        >
          {t(
            `すべて見る(${props.selectedWorkIds.length})`,
            `View All (${props.selectedWorkIds.length})`,
          )}
        </button>
      )}

      {/* ダイアログ外では先頭3件だけサムネ表示 */}
      <div className="flex flex-wrap items-center">
        {sortedSelectedWorks.slice(0, 3).map((work) => (
          <div key={work.id} className="relative m-2 size-16 md:h-24 md:w-24">
            <img
              className="size-16 rounded-md object-cover md:h-24 md:w-24"
              src={work.smallThumbnailImageURL}
              alt=""
            />
            <div className="absolute bottom-0 bg-gray-800 bg-opacity-50 text-white text-xs">
              {truncateTitle(work.title, 8)}
            </div>
            <div className="absolute top-1 left-1 rounded-full border-2 bg-black dark:bg-white">
              <CheckIcon className="p-1 text-white dark:text-black" />
            </div>
          </div>
        ))}

        {/* 「＋」ボタン */}
        <div className="border-2 border-transparent p-1">
          <Button
            onClick={() => setIsOpen(true)}
            className="size-16 md:h-24 md:w-24"
            size="icon"
            variant="secondary"
          >
            <PlusIcon />
          </Button>
        </div>
      </div>

      {/* ダイアログ */}
      <Dialog open={isOpen} onOpenChange={(opened) => setIsOpen(opened)}>
        <DialogContent className="min-h-[40vw] min-w-[88vw] pl-2">
          <DialogHeader>
            <DialogTitle>{t("作品選択", "Select Works")}</DialogTitle>
          </DialogHeader>

          <Tabs className="mt-2 mb-8" value={tab} defaultValue="NO_SELECTED">
            <TabsList>
              <TabsTrigger
                onClick={() => setTab("NO_SELECTED")}
                className="w-full"
                value="NO_SELECTED"
              >
                {t("未選択", "Not Selected")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => setTab("SELECTED")}
                className="w-full"
                value="SELECTED"
              >
                {t("選択中", "Selected")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="max-h-80 overflow-y-auto md:max-h-[100%]">
            {tab === "NO_SELECTED" && (
              <div className="flex flex-wrap">{renderWorks(works)}</div>
            )}
            {tab === "SELECTED" && (
              <>
                {/* 並び替えトグル */}
                <div className="mb-4 flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDragMode(!isDragMode)}
                  >
                    {isDragMode
                      ? t("並び替え終了", "Stop Sorting")
                      : t("並び替え", "Sort")}
                  </Button>
                </div>
                {/* DnD表示 or クリック解除表示 */}
                {isDragMode ? (
                  renderSelectedWorksDnD()
                ) : (
                  <div className="flex flex-wrap">
                    {renderWorks(sortedSelectedWorks)}
                  </div>
                )}
              </>
            )}
          </ScrollArea>

          {/* ページネーション */}
          {tab === "NO_SELECTED" && (
            <ResponsivePagination
              perPage={32}
              maxCount={worksMaxCount}
              currentPage={page}
              onPageChange={(p: number) => setPage(p)}
            />
          )}
          {tab === "SELECTED" && (
            <ResponsivePagination
              perPage={32}
              maxCount={selectedWorksMaxCount}
              currentPage={selectedPage}
              onPageChange={(p: number) => setSelectedPage(p)}
            />
          )}

          <div className="mt-4 flex gap-2">
            <Button onClick={() => setIsOpen(false)}>
              {t("決定", "Confirm")}
            </Button>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              {t("キャンセル", "Cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
