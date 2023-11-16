"use client"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const GenerationHistoryDeleteDialog = (props: Props) => {
  return (
    <AlertDialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          props.onClose()
        }
      }}
      open={props.isOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogDescription>
            {"削除する履歴を選択してください"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            // colorScheme="primary"
            onClick={() => {
              props.onClose()
            }}
          >
            {"OK"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    /**
     * 対象が選択されている場合のモーダル
     */
    // <AlertDialog
    //   onOpenChange={(isOpen) => {
    //     if (!isOpen) {
    //       props.onClose()
    //     }
    //   }}
    //   open={props.isOpen}
    // >
    //   <AlertDialogContent>
    //     <AlertDialogHeader>
    //       <AlertDialogDescription>
    //         {"本当に削除しますか？"}
    //       </AlertDialogDescription>
    //     </AlertDialogHeader>
    //     <AlertDialogFooter>
    //       <Button
    //         // colorScheme="primary"
    //         onClick={() => {
    //           props.onClose()
    //           alert("削除しました")
    //         }}
    //       >
    //         {"はい"}
    //       </Button>
    //       <Button
    //         onClick={() => {
    //           props.onClose()
    //         }}
    //       >
    //         {"やめる"}
    //       </Button>
    //     </AlertDialogFooter>
    //   </AlertDialogContent>
    // </AlertDialog>
  )
}
