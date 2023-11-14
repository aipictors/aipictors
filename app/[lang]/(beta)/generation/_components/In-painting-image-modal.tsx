"use client"

import { InPaintingImage } from "@/app/[lang]/(beta)/generation/_components/in-painting-image"
import { InPaintingSetting } from "@/app/[lang]/(beta)/generation/_components/in-painting-setting"
import {
  Button,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const InPaintingImageModal = (props: Props) => {
  return (
    <Modal
      onClose={props.onClose}
      isOpen={props.isOpen}
      scrollBehavior={"inside"}
      size={"4xl"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader />
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <Stack alignItems={"center"}>
              <Text fontSize={"lg"}>{"一部修正"}</Text>
              <Text fontSize={"md"}>
                {
                  "画像の修正したい箇所を塗潰して置き換えたい内容のキーワードを入力してください"
                }
              </Text>
            </Stack>
            <Stack spacing={2}>
              <HStack justifyContent={"flex-start"}>
                <Text>{"修正内容のキーワード（英単語）:"}</Text>
              </HStack>
              <Input placeholder="一部修正" />
            </Stack>
            <InPaintingSetting />
            <InPaintingImage />
            <HStack justifyContent={"center"}>
              <Button
                borderRadius={"full"}
                colorScheme="primary"
                onClick={() => {
                  props.onClose()
                }}
              >
                {"修正する"}
              </Button>
            </HStack>
          </Stack>
        </ModalBody>
        <ModalFooter justifyContent={"center"} />
      </ModalContent>
    </Modal>
  )
}
