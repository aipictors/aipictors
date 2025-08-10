import { useContext, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { useSuspenseQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { ImageIcon, CheckIcon, PlusIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import React from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { ScrollArea } from "~/components/ui/scroll-area"
import { type FragmentOf, graphql } from "gql.tada"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation" // 翻訳対応

type Props = {
  children?: React.ReactNode
  selectedWorks: FragmentOf<typeof DialogWorkFragment>[]
  setSelectedWorks: (works: FragmentOf<typeof DialogWorkFragment>[]) => void
  limit?: number
}

/**
 * 作成済みの作品選択ダイアログ
 */
export function SelectCreatedSensitiveWorksDialog(props: Props) {
  const t = useTranslation()

  const appContext = useContext(AuthContext)

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [page, setPage] = React.useState(0)

  const [tab, setTab] = useState<"NO_SELECTED" | "SELECTED">("NO_SELECTED")

  const worksResult = useSuspenseQuery(worksQuery, {
    skip:
      appContext.isLoading || appContext.isNotLoggedIn || !appContext.userId,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        userId: appContext.userId,
        orderBy: "DATE_CREATED",
        sort: "DESC",
        isSensitive: true,
      },
    },
  })

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip:
      appContext.isLoading || appContext.isNotLoggedIn || !appContext.userId,
    variables: {
      where: {
        userId: appContext.userId,
        isSensitive: true,
      },
    },
  })

  const works = worksResult.data?.works
  const worksMaxCount = worksCountResp.data?.worksCount ?? 0

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  const handleWorkClick = (work: FragmentOf<typeof DialogWorkFragment>) => {
    if (props.selectedWorks.some((w) => w.id === work.id)) {
      props.setSelectedWorks(
        props.selectedWorks.filter((w) => w.id !== work.id),
      )
    } else {
      if (!props.limit || props.selectedWorks.length < props.limit) {
        props.setSelectedWorks([...props.selectedWorks, work])
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

  const renderWorks = (
    worksToRender: FragmentOf<typeof DialogWorkFragment>[],
  ) => {
    return worksToRender.map((work) => (
      <div key={work.id}>
        <button
          type="button"
          className="relative m-2 size-24 cursor-pointer"
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
          {props.selectedWorks.some((w) => w.id === work.id) && (
            <div className="absolute top-1 left-1 rounded-full border-2 bg-black dark:bg-white">
              <CheckIcon className="p-1 text-white dark:text-black" />
            </div>
          )}
        </button>
      </div>
    ))
  }

  if (!works?.length) {
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
      {props.selectedWorks.length > 7 && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="m-2 cursor-pointer text-right text-sm opacity-80"
        >
          {t(
            `すべて見る(${props.selectedWorks.length})`,
            `View All (${props.selectedWorks.length})`,
          )}
        </button>
      )}

      <div className="flex flex-wrap items-center">
        {props.selectedWorks.slice(0, 7).map((work) => (
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
        <div className="border-2 border-transparent p-1">
          <Button
            onClick={() => setIsOpen(true)}
            className="size-16 md:h-24 md:w-24"
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
          <DialogHeader>
            <DialogTitle>{t("作品選択", "Select Works")}</DialogTitle>
          </DialogHeader>

          <Tabs className="mt-2 mb-8" value={tab} defaultValue={"NO_SELECTED"}>
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
                {renderWorks(props.selectedWorks)}
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
