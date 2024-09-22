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
import { type FragmentOf, graphql } from "gql.tada"
import React from "react"
import { StickerChangeAccessTypeActionDialog } from "~/routes/($lang).settings.sticker/components/sticker-change-access-type-action-dialog"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  sticker: FragmentOf<typeof StickerAccessTypeDialogFragment>
  /**
   * TODO: childrenを受け取ると壊れる
   */
  children: React.ReactNode
  onAccessTypeChange(): void
}

/**
 * スタンプ公開状態変更ダイアログ
 */
export function StickerChangeAccessTypeDialog(props: Props) {
  const [updateSticker, { loading: isChangeStickerAccessType }] = useMutation(
    updateStickerMutation,
  )

  const [accessType, setAccessType] = React.useState(props.sticker.accessType)
  const t = useTranslation()

  if (props.sticker.imageUrl === null) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("タイトル：", "Title:")}
            {props.sticker.title}
          </DialogTitle>
        </DialogHeader>
        {accessType === "PRIVATE" ? (
          <img
            className="m-auto mb-2 w-24 duration-500"
            src={props.sticker.imageUrl}
            alt={props.sticker.title}
          />
        ) : (
          <Link className="m-auto w-24" to={`/stickers/${props.sticker.id}`}>
            <img
              className="m-auto mb-2 w-24 cursor-pointer duration-500 hover:scale-105"
              src={props.sticker.imageUrl}
              alt={props.sticker.title}
            />
          </Link>
        )}
        <DialogFooter>
          {accessType === "PRIVATE" ? (
            <StickerChangeAccessTypeActionDialog
              title={props.sticker.title}
              stickerId={props.sticker.id}
              imageUrl={props.sticker.imageUrl}
              accessType={accessType}
              onAccessTypeChange={props.onAccessTypeChange}
            >
              <Button className="w-full">{t("公開する", "Make Public")}</Button>
            </StickerChangeAccessTypeActionDialog>
          ) : (
            <Button disabled={true} className="w-full">
              {t("公開済み", "Already Public")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const StickerAccessTypeDialogFragment = graphql(
  `fragment StickerAccessTypeDialog on StickerNode @_unmask {
    id
    title
    imageUrl
    accessType
  }`,
)

const updateStickerMutation = graphql(
  `mutation updateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
    }
  }`,
)
