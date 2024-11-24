"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { useTranslation } from "~/hooks/use-translation"
import { Button } from "~/components/ui/button"
import { Loader2Icon, Trash } from "lucide-react"
import { toast } from "sonner"
import { graphql } from "gql.tada"
import { useMutation } from "@apollo/client/index"

type Props = {
  postId: string
}

export function DeleteWorkConfirmDialog(props: Props) {
  const t = useTranslation()

  const [deleteWork, { loading: isLoadingDeleteAlbum }] =
    useMutation(DeleteWorkMutation)

  const [isOpen, setIsOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const [isDeleted, setIsDeleted] = useState(false)

  const onDeleteWork = async (workId: string) => {
    await deleteWork({
      variables: {
        input: {
          workId: workId,
        },
      },
    })
    toast(
      t(
        "作品を削除しました、しばらくしたらアクセスできなくなります",
        "The post has been deleted",
      ),
    )
    setIsDeleted(true)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          className="flex items-center gap-2"
          variant="destructive"
          disabled={isDeleted}
          onClick={() => setIsOpen(true)}
        >
          {isLoading ? <Loader2Icon className="animate-spin" /> : <Trash />}
          {isDeleted ? t("削除済み", "Deleted") : t("削除", "Delete")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("確認", "Confirm")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "本当にこの作品を削除しますか？",
              "Are you sure you want to delete this post?",
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            {t("キャンセル", "Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onDeleteWork(props.postId)}>
            {t("削除", "Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const DeleteWorkMutation = graphql(
  `mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
    }
  }`,
)
