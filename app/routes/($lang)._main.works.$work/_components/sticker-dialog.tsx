import { Button } from "@/_components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/_components/ui/dialog"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { AuthContext } from "@/_contexts/auth-context"
import { viewerUserStickersQuery } from "@/_graphql/queries/viewer/viewer-user-stickers"
import { useQuery } from "@apollo/client/index"
import { useContext, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { StickerButton } from "@/routes/($lang)._main.works.$work/_components/sticker-button"
import { AddStickerButton } from "@/_components/add-sticker-button"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { viewerUserStickersCountQuery } from "@/_graphql/queries/viewer/viewer-user-stickers-count"

type Props = {
  isOpen: boolean
  onClose(): void
  onSend(stickerId: string, stickerImageURL: string): void
}

/**
 * スタンプ送信ダイアログ
 */
export const StickerDialog = (props: Props) => {
  const appContext = useContext(AuthContext)

  const [createdSortStickerPage, setCreatedSortStickerPage] = useState(0)

  const [relatedSortStickerPage, setRelatedSortStickerPage] = useState(0)

  const [type, setType] = useState("CREATED")

  const { data: stickers = null, refetch } = useQuery(viewerUserStickersQuery, {
    skip: appContext.isLoading,
    variables: {
      limit: 64,
      offset: createdSortStickerPage * 64,
      orderBy: "DATE_CREATED",
    },
  })

  const { data: stickersCount = null } = useQuery(
    viewerUserStickersCountQuery,
    {
      skip: appContext.isLoading,
    },
  )

  const { data: relatedStickers = null } = useQuery(viewerUserStickersQuery, {
    skip: appContext.isLoading,
    variables: {
      limit: 64,
      offset: 0,
      orderBy: "DATE_USED",
    },
  })

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
            <>
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
            </>
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
              perPage={64}
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
