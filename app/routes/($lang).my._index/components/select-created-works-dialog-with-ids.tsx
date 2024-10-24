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
import { useTranslation } from "~/hooks/use-translation" // useTranslationをインポート

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
  const t = useTranslation() // 翻訳フックの使用
  const appContext = useContext(AuthContext)

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [page, setPage] = useState(0)
  const [selectedPage, setSelectedPage] = useState(0)
  const [tab, setTab] = useState<"NO_SELECTED" | "SELECTED">("NO_SELECTED")

  // 選択された作品をオンメモリで管理
  const [selectedWorksOnMemory, setSelectedWorksOnMemory] = useState<
    FragmentOf<typeof DialogWorkFragment>[]
  >([])

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

  const worksCountResp = useQuery(worksCountQuery, {
    skip: appContext.isLoading,
    variables: {
      where: {
        userId: appContext.userId,
      },
    },
  })

  // selectedWorkIdsが変更されたときにオンメモリのリストを更新
  useEffect(() => {
    if (worksResult.data?.works) {
      const selectedWorks = worksResult.data.works.filter((work) =>
        props.selectedWorkIds.includes(work.id),
      )
      setSelectedWorksOnMemory(selectedWorks)
    }
  }, [props.selectedWorkIds, worksResult.data])

  const works = worksResult.data?.works
  const worksMaxCount = worksCountResp.data?.worksCount ?? 0

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  const handleWorkClick = (work: FragmentOf<typeof DialogWorkFragment>) => {
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
          {selectedWorksOnMemory.some((w) => w.id === work.id) && (
            <div className="absolute top-1 left-1 rounded-full border-2 bg-black dark:bg-white">
              <CheckIcon className="p-1 text-white dark:text-black" />
            </div>
          )}
        </div>
      </div>
    ))
  }

  if (!works?.length) {
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
        <div className="border-2 border-transparent p-1">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 md:h-24 md:w-24"
            size={"icon"}
            variant={"secondary"}
          >
            <PlusIcon />
          </Button>
        </div>
      </div>
      <Dialog
        open={isOpen}
        onOpenChange={(isOpen) => {
          setIsOpen((prev) => (prev !== isOpen ? isOpen : prev))
        }}
      >
        <DialogContent className="min-h-[40vw] min-w-[88vw] pl-2">
          {t("作品選択", "Select Works")}
          <>
            <Tabs
              className="mt-2 mb-8"
              value={tab}
              defaultValue={"NO_SELECTED"}
            >
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
                <div className="flex flex-wrap">
                  {renderWorks(selectedWorksOnMemory)}
                </div>
              )}
            </ScrollArea>
            {tab === "NO_SELECTED" && (
              <ResponsivePagination
                perPage={32}
                maxCount={worksMaxCount}
                currentPage={page}
                onPageChange={(page: number) => setPage(page)}
              />
            )}
            {tab === "SELECTED" && (
              <ResponsivePagination
                perPage={32}
                maxCount={props.selectedWorkIds.length}
                currentPage={selectedPage}
                onPageChange={(page: number) => setSelectedPage(page)}
              />
            )}
          </>
          <div className="space-y-4">{""}</div>
          <Button onClick={() => setIsOpen(false)}>
            {t("決定", "Confirm")}
          </Button>
          <Button variant={"secondary"} onClick={() => setIsOpen(false)}>
            {t("キャンセル", "Cancel")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const DialogWorkFragment = graphql(
  `fragment DialogWork on WorkNode @_unmask {
    id
    title
    smallThumbnailImageURL
  }`,
)

const worksCountQuery = graphql(
  `query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...DialogWork
    }
  }`,
  [DialogWorkFragment],
)
