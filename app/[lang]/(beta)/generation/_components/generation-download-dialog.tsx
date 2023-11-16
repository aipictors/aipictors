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

export const GenerationDownloadDialog = (props: Props) => {
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
            {"ダウンロード対象を選択してください"}
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
    // <Modal
    //   onClose={props.onClose}
    //   isOpen={props.isOpen}
    //   scrollBehavior={"inside"}
    //   size={"sm"}
    // >
    //   <ModalOverlay />
    //   <ModalContent>
    //     <ModalHeader />
    //     <ModalBody alignItems={"center"} justifyContent={"center"}>
    //       <HStack justifyContent={"center"}>
    //         <Text>{"ダウンロードしました"}</Text>
    //       </HStack>
    //     </ModalBody>
    //     <ModalFooter justifyContent={"center"}>
    //       <Button
    //         borderRadius={"full"}
    //         colorScheme="primary"
    //         onClick={() => {
    //           props.onClose()
    //         }}
    //       >
    //         {"OK"}
    //       </Button>
    //     </ModalFooter>
    //   </ModalContent>
    // </Modal>
  )
}
