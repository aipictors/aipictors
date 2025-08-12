import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { useMutation } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import React, { useEffect } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  title: string
  stickerId: string
  imageUrl: string | null
  isDownloaded: boolean
  children: React.ReactNode
}

/**
 * スタンプ情報ダイアログ（作品ダイアログ用）
 */
export function StickerInfoDialog(props: Props) {
  const [createUserSticker, { loading: isCreatingUserSticker }] = useMutation(
    createUserStickerMutation,
  )

  const t = useTranslation()

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

  useEffect(() => {
    setIsDownloaded(props.isDownloaded)
  }, [props.isDownloaded])

  const [isDownloaded, setIsDownloaded] = React.useState(props.isDownloaded)

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("タイトル：", "Title: ")}
            {props.title}
          </DialogTitle>
        </DialogHeader>
        {props.imageUrl && (
          <Link className="m-auto w-24" to={`/stickers/${props.stickerId}`}>
            <img
              className="m-auto mb-2 w-24 cursor-pointer duration-500 hover:scale-105"
              src={props.imageUrl}
              alt={props.title}
            />
          </Link>
        )}
        <DialogFooter>
          {!isDownloaded ? (
            <Button className="w-full" onClick={onDownload}>
              {isCreatingUserSticker ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <span>{t("マイスタンプに追加", "Add to My Stickers")}</span>
              )}
            </Button>
          ) : (
            <Button disabled={true} className="w-full" onClick={onDownload}>
              {t("追加済み", "Already Added")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const createUserStickerMutation = graphql(
  `mutation CreateUserSticker($input: CreateUserStickerInput!) {
    createUserSticker(input: $input) {
      id
    }
  }`,
)
