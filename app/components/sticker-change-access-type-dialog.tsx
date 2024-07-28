import { StickerChangeAccessTypeActionDialog } from "~/components/sticker-change-access-type-action-dialog"
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
import React from "react"
import { toast } from "sonner"

type Props = {
  title: string
  stickerId: string
  imageUrl: string
  children: React.ReactNode
  accessType: "PUBLIC" | "PRIVATE"
  onAccessTypeChange(): void
}

/**
 * スタンプ公開状態変更ダイアログ
 */
export const StickerChangeAccessTypeDialog = (props: Props) => {
  const [updateSticker, { loading: isChangeStickerAccessType }] = useMutation(
    updateStickerMutation,
  )

  const onChangePublic = async () => {
    await updateSticker({
      variables: {
        input: {
          stickerId: props.stickerId,
          accessType: "PUBLIC",
        },
      },
    })
    toast("公開しました")
    setAccessType("PUBLIC")
  }

  const [accessType, setAccessType] = React.useState(props.accessType)

  return (
    <Dialog>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>タイトル：{props.title}</DialogTitle>
        </DialogHeader>
        {accessType === "PRIVATE" ? (
          <img
            className="m-auto mb-2 w-24 duration-500"
            src={props.imageUrl}
            alt={props.title}
          />
        ) : (
          <Link
            className="m-auto w-24"
            to={`https://www.aipictors.com/stamp/?id=${props.stickerId}`}
          >
            <img
              className="m-auto mb-2 w-24 cursor-pointer duration-500 hover:scale-105"
              src={props.imageUrl}
              alt={props.title}
            />
          </Link>
        )}
        <DialogFooter>
          {accessType === "PRIVATE" ? (
            <StickerChangeAccessTypeActionDialog
              title={props.title}
              stickerId={props.stickerId}
              imageUrl={props.imageUrl}
              accessType={accessType}
              onAccessTypeChange={props.onAccessTypeChange}
            >
              <Button className="w-full">{"公開する"}</Button>
            </StickerChangeAccessTypeActionDialog>
          ) : (
            <Button disabled={true} className="w-full">
              {"公開済み"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const updateStickerMutation = graphql(
  `mutation updateSticker($input: UpdateStickerInput!) {
    updateSticker(input: $input) {
      id
    }
  }`,
)
