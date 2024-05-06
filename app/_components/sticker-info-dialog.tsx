import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog"
import { createUserStickerMutation } from "@/_graphql/mutations/create-user-sticker"
import { useMutation } from "@apollo/client/index"
import { Loader2Icon } from "lucide-react"
import React from "react"

type Props = {
  title: string
  stickerId: string
  imageUrl: string
  isDownloaded: boolean
  children: React.ReactNode
}

/**
 * スタンプ情報ダイアログ
 */
export const StickerInfoDialog = (props: Props) => {
  const [createUserSticker, { loading: isCreatingUserSticker }] = useMutation(
    createUserStickerMutation,
  )

  const onDownload = async () => {
    await createUserSticker({
      variables: {
        input: {
          stickerId: props.stickerId,
        },
      },
    })
    setIsDownloaded(true)
  }

  const [isDownloaded, setIsDownloaded] = React.useState(props.isDownloaded)

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>タイトル：{props.title}</DialogTitle>
        </DialogHeader>
        <a
          className="m-auto w-24"
          href={`https://www.aipictors.com/stamp/?id=${props.stickerId}`}
        >
          <img
            className="m-auto mb-2 w-24 cursor-pointer duration-500 hover:scale-105"
            src={props.imageUrl}
            alt={props.title}
          />
        </a>
        <DialogFooter>
          {!isDownloaded ? (
            <Button className="w-full" onClick={onDownload}>
              {isCreatingUserSticker ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <span>{"ダウンロード"}</span>
              )}
            </Button>
          ) : (
            <Button disabled={true} className="w-full" onClick={onDownload}>
              {"ダウンロード済み"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
