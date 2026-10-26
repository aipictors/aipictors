import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { userModelsQueryKeys } from "~/components/user-models/use-user-models"
import { deleteUserModel } from "~/lib/user-models/client"
import type { UserModel } from "~/lib/user-models/types"

type Props = {
  model: Pick<UserModel, "id" | "name">
  isOpen: boolean
  onOpenChange(isOpen: boolean): void
  onDeleted?(): void
}

/**
 * モデル削除の確認（作者のみ）
 */
export function UserModelDeleteDialog(props: Props) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const onDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteUserModel(props.model.id)
      queryClient.removeQueries({
        queryKey: userModelsQueryKeys.detail(props.model.id),
      })
      queryClient.invalidateQueries({ queryKey: userModelsQueryKeys.all })
      toast("モデルを削除しました")
      props.onOpenChange(false)
      props.onDeleted?.()
    } catch (error) {
      toast(error instanceof Error ? error.message : "削除に失敗しました")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            「{props.model.name}」を削除しますか？
          </AlertDialogTitle>
          <AlertDialogDescription>
            削除すると一覧に表示されなくなり、生成にも使えなくなります。登録数の枠は空きます。この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              onDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "削除中…" : "削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
