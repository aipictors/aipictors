"use client"

import { InPaintingSelectedPromptModal } from "@/app/[lang]/(beta)/generation/_components/in-painting-selected-prompt-modal"
import { StarRating } from "@/app/[lang]/(beta)/generation/_components/star-rating"
import {
  Button,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { useState } from "react"

type Props = {
  isOpen: boolean
  onClose(): void
  onChangeRating(value: number): void
  onOpenInPainting(): void
}

export const SelectedWorkModal = (props: Props) => {
  const {
    isOpen: isPromptOpen,
    onOpen: onPromptOpen,
    onClose: onPromptClose,
  } = useDisclosure()

  const [rating, setRating] = useState(0)

  return (
    <>
      <Modal
        onClose={props.onClose}
        isOpen={props.isOpen}
        scrollBehavior={"inside"}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader />
          <ModalCloseButton />
          <ModalBody justifyContent={"center"}>
            <Stack spacing={2} alignItems={"center"}>
              <Image
                boxSize={"lg"}
                src="https://source.unsplash.com/random/800x600"
                alt=""
              />
              <Text fontSize={"sm"}>
                {
                  "選んだプロンプトたち：masterpiece, best quality, extremely detailed, anime, girl, skirt, donut, braids,"
                }
              </Text>
              <Button
                size={"xs"}
                variant={"ghost"}
                textColor={"blue.400"}
                onClick={() => {
                  onPromptOpen()
                  props.onClose()
                }}
              >
                {"more"}
              </Button>
              <Stack spacing={2}>
                <HStack justifyContent={"center"} spacing={2}>
                  <Button
                    borderRadius={"md"}
                    onClick={() => {
                      alert("再利用します")
                    }}
                  >
                    {"再利用"}
                  </Button>
                  <Button
                    borderRadius={"md"}
                    onClick={() => {
                      alert("DLします")
                    }}
                  >
                    {"DL"}
                  </Button>
                  <Button borderRadius={"md"}>{"投稿"}</Button>
                  <Button borderRadius={"md"} onClick={props.onOpenInPainting}>
                    {"一部修正"}
                  </Button>
                  <Button
                    borderRadius={"md"}
                    onClick={() => {
                      alert("生成情報付きのURLをコピーしました")
                    }}
                  >
                    {"URL"}
                  </Button>
                </HStack>
              </Stack>
              <StarRating
                value={rating}
                onChange={(value) => {
                  setRating(value)
                  props.onChangeRating(value)
                }}
              />
            </Stack>
          </ModalBody>
          <ModalFooter justifyContent={"center"}>
            <Button
              onClick={() => {
                props.onClose()
              }}
              borderRadius={"full"}
              colorScheme="primary"
            >
              {"OK"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <InPaintingSelectedPromptModal
        isOpen={isPromptOpen}
        onClose={onPromptClose}
      />
    </>
  )
}
