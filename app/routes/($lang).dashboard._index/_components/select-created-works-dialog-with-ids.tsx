import { useContext, useState } from "react"
import { Dialog, DialogContent } from "@/_components/ui/dialog"
import { Button } from "@/_components/ui/button"
import { worksQuery } from "@/_graphql/queries/work/works"
import { useSuspenseQuery } from "@apollo/client/index"
import { AuthContext } from "@/_contexts/auth-context"
import { ImageIcon, CheckIcon, PlusIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { worksCountQuery } from "@/_graphql/queries/work/works-count"
import type React from "react"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { ScrollArea } from "@/_components/ui/scroll-area"
import type { ResultOf } from "gql.tada"
import { toast } from "sonner"

type Props = {
  children?: React.ReactNode
  selectedWorkIds: string[]
  setSelectedWorkIds: (workIds: string[]) => void
  limit?: number
  isSensitive?: boolean
}

/**
 * 作成済みの作品選択ダイアログ
 */
export const SelectCreatedWorksDialogWithIds = (props: Props) => {
  const appContext = useContext(AuthContext)

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [page, setPage] = useState(0)

  const [selectedPage, setSelectedPage] = useState(0)

  const [tab, setTab] = useState<"NO_SELECTED" | "SELECTED">("NO_SELECTED")

  const worksResult = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        userId: appContext.userId,
        orderBy: "DATE_CREATED",
        sort: "DESC",
        isSensitive: props.isSensitive,
      },
    },
  })

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: appContext.isLoading,
    variables: {
      where: {
        userId: appContext.userId,
        isSensitive: props.isSensitive,
      },
    },
  })

  const worksByIdsResult = useSuspenseQuery(worksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        ids: props.selectedWorkIds,
      },
    },
  })

  const selectedWorks = worksByIdsResult.data?.works ?? []

  const works = worksResult.data?.works

  const worksMaxCount = worksCountResp.data?.worksCount ?? 0

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  const handleWorkClick = (work: ResultOf<typeof worksQuery>["works"][0]) => {
    if (selectedWorks.some((w) => w.id === work.id)) {
      props.setSelectedWorkIds(
        props.selectedWorkIds.filter((w) => w !== work.id),
      )
    } else {
      if (!props.limit || selectedWorks.length < props.limit) {
        props.setSelectedWorkIds(
          [...props.selectedWorkIds, work.id].filter(
            (workId, index, self) => self.indexOf(workId) === index,
          ),
        )
      } else {
        toast(`選択できる作品数は${props.limit}つまでです。`)
      }
    }
  }

  const renderWorks = (worksToRender: ResultOf<typeof worksQuery>["works"]) => {
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
          {selectedWorks.some((w) => w.id === work.id) && (
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
        <p className="p-4 text-center text-sm">作品がありません。</p>
      </div>
    )
  }

  return (
    <>
      {selectedWorks.length > 7 && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <p
          onClick={() => setIsOpen(true)}
          className="m-2 cursor-pointer text-right text-sm opacity-80"
        >
          すべて見る({props.selectedWorkIds.length})
        </p>
      )}

      <div className="flex flex-wrap items-center">
        {selectedWorks.slice(0, 3).map((work) => (
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
          作品選択
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
                  未選択
                </TabsTrigger>
                <TabsTrigger
                  onClick={() => setTab("SELECTED")}
                  className="w-full"
                  value="SELECTED"
                >
                  選択中
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <ScrollArea className="max-h-80 overflow-y-auto md:max-h-[100%]">
              {tab === "NO_SELECTED" && (
                <>
                  <div className="flex flex-wrap">{renderWorks(works)}</div>
                </>
              )}
              {tab === "SELECTED" && (
                <div className="flex flex-wrap">
                  {renderWorks(worksByIdsResult.data?.works ?? [])}
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
          <Button onClick={() => setIsOpen(false)}>決定</Button>
          <Button variant={"secondary"} onClick={() => setIsOpen(false)}>
            キャンセル
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
