import { Button } from "@/_components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/_components/ui/dialog"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { AuthContext } from "@/_contexts/auth-context"
import { viewerUserStickersQuery } from "@/_graphql/queries/viewer/viewer-user-stickers"
import { config } from "@/config"
import { useQuery } from "@apollo/client/index.js"
import { PlusIcon } from "lucide-react"
import { useContext, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { StickerButton } from "@/routes/($lang)._main.works.$work/_components/sticker-button"

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

  const [type, setType] = useState("CREATED")

  const { data: stickers = null, refetch } = useQuery(viewerUserStickersQuery, {
    skip: appContext.isLoading,
    variables: {
      limit: config.query.maxLimit,
      offset: 0,
      orderBy: "DATE_CREATED",
    },
  })

  const { data: relatedStickers = null } = useQuery(viewerUserStickersQuery, {
    skip: appContext.isLoading,
    variables: {
      limit: 16,
      offset: 0,
      orderBy: "DATE_USED",
    },
  })

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
              最近使用
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="w-full">
          {type === "CREATED" && (
            <div className="m-auto grid max-h-[64vh] max-w-[80vw] grid-cols-3 gap-2 2xl:grid-cols-8 md:grid-cols-4 xl:grid-cols-6">
              {stickers?.viewer?.userStickers?.map((sticker) => (
                <StickerButton
                  key={sticker.id}
                  imageUrl={sticker.image?.downloadURL}
                  title={sticker.title}
                  onClick={() => {
                    props.onSend(sticker.id, sticker.image?.downloadURL ?? "")
                    props.onClose()
                  }}
                />
              ))}
              <Button size={"icon"} variant={"secondary"}>
                <PlusIcon />
              </Button>
            </div>
          )}
          {type === "RELATED" && (
            <div className="m-auto grid max-h-[64vh] max-w-[80vw] grid-cols-3 gap-2 2xl:grid-cols-8 md:grid-cols-4 xl:grid-cols-6">
              {relatedStickers?.viewer?.userStickers?.map((sticker) => (
                <StickerButton
                  key={sticker.id}
                  imageUrl={sticker.image?.downloadURL}
                  title={sticker.title}
                  onClick={() => {
                    props.onSend(sticker.id, sticker.image?.downloadURL ?? "")
                  }}
                />
              ))}
              <Button size={"icon"} variant={"secondary"}>
                <PlusIcon />
              </Button>
            </div>
          )}
        </ScrollArea>
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
