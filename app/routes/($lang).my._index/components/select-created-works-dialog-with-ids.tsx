import { useContext, useState, useEffect } from "react"
import { Dialog, DialogContent } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { ImageIcon, CheckIcon, PlusIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import type React from "react"
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
  children?: React.ReactNode
  selectedWorkIds: string[]
  setSelectedWorkIds: (workIds: string[]) => void
  limit?: number
}

/**
 * 作成済みの作品選択ダイアログ
 */
export function SelectCreatedWorksDialogWithIds(props: Props) {
  const t = useTranslation()
  const appContext = useContext(AuthContext)

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [page, setPage] = useState(0)
  const [selectedPage, setSelectedPage] = useState(0)
  const [tab, setTab] = useState<"NO_SELECTED" | "SELECTED">("NO_SELECTED")

  // 並び替えトグル (true でドラッグモード)
  const [isDragMode, setIsDragMode] = useState(false)

  // 選択された作品をオンメモリで管理（表示用）
  const [selectedWorksOnMemory, setSelectedWorksOnMemory] = useState<
    FragmentOf<typeof DialogWorkFragment>[]
  >([])

  // ======== 全作品（NO_SELECTED 用） ========
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

  // ======== 全作品数 (ページネーション) ========
  const worksCountResp = useQuery(worksCountQuery, {
    skip: appContext.isLoading,
    variables: {
      where: {
        userId: appContext.userId,
      },
    },
  })
  const worksMaxCount = worksCountResp.data?.worksCount ?? 0

  // ======== タイトルを省略するヘルパー ========
  const truncateTitle = (title: string, maxLength: number) =>
    title.length > maxLength ? `${title.slice(0, maxLength)}...` : title

  // ======== 作品クリック (未選択タブ) ========
  const handleWorkClick = (work: FragmentOf<typeof DialogWorkFragment>) => {
    // 既に選択中なら解除、そうでなければ選択
    const isAlreadySelected = props.selectedWorkIds.includes(work.id)
    if (isAlreadySelected) {
      const newIds = props.selectedWorkIds.filter((id) => id !== work.id)
      props.setSelectedWorkIds(newIds)
      setSelectedWorksOnMemory((prev) => prev.filter((w) => w.id !== work.id))
    } else {
      if (!props.limit || selectedWorksOnMemory.length < props.limit) {
        const newIds = [...props.selectedWorkIds, work.id]
        props.setSelectedWorkIds(newIds)
        // 作品をオンメモリにも追加
        setSelectedWorksOnMemory((prev) => [...prev, work])
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

  const handleWorkSelectorClick = (
    work: FragmentOf<typeof DialogWorkFragment>,
  ) => {
    if (selectedWorksOnMemory.some((w) => w.id === work.id)) {
      props.setSelectedWorkIds(
        props.selectedWorkIds.filter((w) => w !== work.id),
      )
      setSelectedWorksOnMemory(
        selectedWorksOnMemory.filter((w) => w.id !== work.id),
      )
    } else {
      if (!props.limit || selectedWorksOnMemory.length < props.limit) {
        props.setSelectedWorkIds([...props.selectedWorkIds, work.id])
        setSelectedWorksOnMemory([...selectedWorksOnMemory, work])
      } else {
        toast(
          t(
            `選択できる作品数は${props.limit}つまでです。`,
            `You can select up to ${props.limit} works.`,
          ),
        ) // 翻訳対応
      }
    }
  }

  // ======== 選択中の作品を props.selectedWorkIds の順番でセット ========
  useEffect(() => {
    // worksResult.data.works だけでは全部取得できないかもしれないため、
    // 全作品の中からフィルタする方式なら、本来はページネーション外も全部要る。
    // ここでは「既に取得できている作品からのフィルタ」として簡易実装。

    // もし全作品を取得できていない場合は適宜クエリ追加 or
    // あるいは親コンポーネントで "selectedWorkIdsに対応する作品" を全部渡す設計などに切り替える。

    // とりあえず worksResult.data.works から該当分をフィルタ
    const allWorks = worksResult.data?.works ?? []
    // まずフィルタ
    const filtered = allWorks.filter((w) =>
      props.selectedWorkIds.includes(w.id),
    )
    // 順番どおりソート
    const sorted = props.selectedWorkIds
      .map((id) => filtered.find((w) => w.id === id))
      .filter(Boolean) as FragmentOf<typeof DialogWorkFragment>[]

    // state更新
    setSelectedWorksOnMemory(sorted)
  }, [props.selectedWorkIds, worksResult.data])

  // ======== 未選択タブの描画 ========
  const renderWorks = (
    worksToRender: FragmentOf<typeof DialogWorkFragment>[],
  ) => {
    return worksToRender.map((work) => (
      <div key={work.id}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div
          className="relative m-2 h-24 w-24 cursor-pointer"
          onClick={() => handleWorkClick(work)}
        >
          <img
            className="h-24 w-24 rounded-md object-cover"
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
        </div>
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
    const found = selectedWorksOnMemory.find((w) => w.id === active.id)
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

        // onMemory も同様に並び替える
        const oldArray = selectedWorksOnMemory
        const newArray = arrayMove(oldArray, oldIndex, newIndex)
        setSelectedWorksOnMemory(newArray)
      }
    }
    setActiveDragItem(null)
  }

  // ソート可能アイテム
  function SortableItem({
    work,
  }: { work: FragmentOf<typeof DialogWorkFragment> }) {
    // drag/drop の動作管理
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: work.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        // 「並び替えモード」でないときはクリックで"選択解除"
        onClick={
          !isDragMode
            ? () => {
                const newIds = props.selectedWorkIds.filter(
                  (id) => id !== work.id,
                )
                props.setSelectedWorkIds(newIds)
                setSelectedWorksOnMemory((prev) =>
                  prev.filter((w) => w.id !== work.id),
                )
              }
            : undefined
        }
        className={
          isDragMode
            ? "relative m-2 cursor-grab" // 並び替えON: grabカーソル
            : "relative m-2 cursor-pointer" // 並び替えOFF: クリック解除用
        }
      >
        <img
          className="h-24 w-24 rounded-md object-cover"
          src={work.smallThumbnailImageURL}
          alt=""
        />
        <div className="absolute bottom-0 bg-gray-800 bg-opacity-50 text-white text-xs">
          {truncateTitle(work.title, 8)}
        </div>
      </div>
    )
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
          items={props.selectedWorkIds} // 順番通りに
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-wrap">
            {selectedWorksOnMemory.map((work) => (
              <SortableItem key={work.id} work={work} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay adjustScale={false} style={{ transformOrigin: "0 0" }}>
          {activeDragItem && (
            <div className="h-24 w-24 border border-gray-300">
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
  // ========== ドラッグ＆ドロップ ここまで ==========

  // もし未選択タブで作品が全くない場合
  if (!works?.length && tab === "NO_SELECTED") {
    return (
      <div className="p-4">
        <ImageIcon className="m-auto h-8 w-8 opacity-70" />
        <p className="p-4 text-center text-sm">
          {t("作品がありません。", "No works available.")}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* 選択中が7件を超えたら「すべて見る」リンク */}
      {selectedWorksOnMemory.length > 7 && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <p
          onClick={() => setIsOpen(true)}
          className="m-2 cursor-pointer text-right text-sm opacity-80"
        >
          {t(
            `すべて見る(${props.selectedWorkIds.length})`,
            `View All (${props.selectedWorkIds.length})`,
          )}
        </p>
      )}

      {/* ダイアログ閉じている時：選択中先頭3件だけサムネ表示 */}
      <div className="flex flex-wrap items-center">
        {selectedWorksOnMemory.slice(0, 3).map((work) => (
          <div key={work.id} className="relative m-2 h-16 w-16 md:h-24 md:w-24">
            <img
              className="h-16 w-16 rounded-md object-cover md:h-24 md:w-24"
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
            className="h-16 w-16 md:h-24 md:w-24"
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
          {t("作品選択", "Select Works")}

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
            {tab === "SELECTED" && isDragMode && (
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

                {/* DnD表示 */}
                {renderSelectedWorksDnD()}
              </>
            )}
            {tab === "SELECTED" && !isDragMode && (
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
                <div className="flex flex-wrap">
                  {renderWorks(selectedWorksOnMemory)}
                </div>{" "}
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
              maxCount={props.selectedWorkIds.length}
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
export const DialogWorkFragment = graphql(`
  fragment DialogWork on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
  }
`)

// ==== GraphQL Queries ====
const worksCountQuery = graphql(`
  query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }
`)

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
