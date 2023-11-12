"use client"

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Stack,
  useToast,
} from "@chakra-ui/react"
import { getAuth, signOut } from "firebase/auth"
import { useRef } from "react"

type Props = {
  isOpen: boolean
  onClose(): void
  onOpen(): void
}

export const LogoutModal: React.FC<Props> = (props) => {
  const cancelRef = useRef(null)

  const toast = useToast()

  const handleLogout = async () => {
    await signOut(getAuth())
    props.onClose()
    toast({ status: "success", description: "ログアウトしました。" })
  }

  return (
    <Stack>
      <AlertDialog
        isOpen={props.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={props.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {"本当にログアウトしますか？"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {
                "ログアウトすると、再度ログインするまでアップロードやコメントができなくなります。"
              }
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button colorScheme="red" onClick={handleLogout}>
                {"はい"}
              </Button>
              <Button ref={cancelRef} onClick={props.onClose} ml={3}>
                {"やめとく"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Stack>
  )
}
