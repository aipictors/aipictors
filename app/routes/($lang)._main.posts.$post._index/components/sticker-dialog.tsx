import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery, useSuspenseQuery } from "@apollo/client/index"
import { useContext, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  StickerButton,
  StickerButtonFragment,
} from "~/routes/($lang)._main.posts.$post._index/components/sticker-button"

import { ResponsivePagination } from "~/components/responsive-pagination"
import { graphql } from "gql.tada"
import { AddStickerButton } from "~/routes/($lang)._main.posts.$post._index/components/add-sticker-button"

type Props = {
  isOpen: boolean
  onClose(): void
  onSend(stickerId: string, stickerImageURL: string): void
}

/**
 * スタンプ送信ダイアログ
 */
export function StickerDialog(props: Props) {
  const appContext = useContext(AuthContext)

  const [createdSortStickerPage, setCreatedSortStickerPage] = useState(0)

  const [relatedSortStickerPage, setRelatedSortStickerPage] = useState(0)

  const [type, setType] = useState("CREATED")

  const maxStickersPage = 120

  const { data: stickers = null, refetch } = useQuery(viewerUserStickersQuery, {
    skip: appContext.isLoading,
    variables: {
      limit: maxStickersPage,
      offset: createdSortStickerPage * maxStickersPage,
      orderBy: "DATE_CREATED",
    },
  })

  const { data: stickersCount = null } = useQuery(
    viewerUserStickersCountQuery,
    {
      skip: appContext.isLoading,
    },
  )

  const { data: relatedStickers = null } = useSuspenseQuery(
    viewerUserStickersQuery,
    {
      skip: appContext.isLoading,
      variables: {
        limit: maxStickersPage,
        offset: 0,
        orderBy: "DATE_USED",
      },
    },
  )

  const maxCount = stickersCount?.viewer?.userStickersCount ?? 0

  return (
    <Dialog onOpenChange={props.onClose} open={props.isOpen}>
      <DialogContent className="min-h-[32vw] min-w-[80vw] pl-2">
        <Tabs value={type} defaultValue={"CREATED"}>
          <TabsList>
            <TabsTrigger
              onClick={() => {
                setType("CREATED")
              }}
              className="w-full"
              value="CREATED"
            >
              保存日
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                setType("RELATED")
              }}
              className="w-full"
              value="RELATED"
            >
              最近の使用
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="w-full">
          {type === "CREATED" && (
            <div className="m-auto flex max-h-[64vh] max-w-[88vw] flex-wrap items-center">
              {stickers?.viewer?.userStickers?.map((sticker) => (
                <StickerButton
                  key={sticker.id}
                  imageUrl={sticker.imageUrl ?? ""}
                  title={sticker.title}
                  onClick={() => {
                    props.onSend(sticker.id, sticker.imageUrl ?? "")
                    props.onClose()
                  }}
                />
              ))}
              <AddStickerButton
                onAddedSicker={() => {
                  refetch()
                }}
              />
            </div>
          )}
          {type === "RELATED" && (
            <div className="m-auto flex max-h-[64vh] max-w-[80vw] flex-wrap items-center">
              {relatedStickers?.viewer?.userStickers?.map((sticker) => (
                <StickerButton
                  key={sticker.id}
                  imageUrl={sticker.imageUrl ?? ""}
                  title={sticker.title}
                  onClick={() => {
                    props.onSend(sticker.id, sticker.imageUrl ?? "")
                  }}
                />
              ))}
              <AddStickerButton
                onAddedSicker={() => {
                  refetch()
                }}
              />
            </div>
          )}
        </ScrollArea>
        {type === "CREATED" && (
          <div className="mt-1 mb-1">
            <ResponsivePagination
              perPage={maxStickersPage}
              maxCount={maxCount}
              currentPage={createdSortStickerPage}
              onPageChange={(page: number) => {
                setCreatedSortStickerPage(page)
              }}
            />
          </div>
        )}
        <DialogFooter>
          <Button
            variant={"secondary"}
            className="m-auto w-full"
            onClick={props.onClose}
          >
            {"キャンセル"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const viewerUserStickersCountQuery = graphql(
  `query ViewerUserStickersCount($where: UserStickersWhereInput) {
    viewer {
      id
      userStickersCount(where: $where)
    }
  }`,
)

const viewerUserStickersQuery = graphql(
  `query ViewerUserStickers($offset: Int!, $limit: Int!, $orderBy: StickerOrderBy, $where: UserStickersWhereInput) {
    viewer {
      id
      userStickers(offset: $offset, limit: $limit, orderBy: $orderBy, where: $where) {
        ...StickerButton
      }
    }
  }`,
  [StickerButtonFragment],
)
