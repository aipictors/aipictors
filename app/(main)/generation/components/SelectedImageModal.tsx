"use client"

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Image,
  HStack,
  Stack,
} from "@chakra-ui/react"
import { useState } from "react"
import { StarRating } from "app/(main)/generation/components/StarRating"

type Props = {
  isOpen: boolean
  onClose(): void
  onChangeRating(value: number): void
}

export const SelectedImageModal: React.FC<Props> = (props) => {
  const [rating, setRating] = useState(0)

  return (
    <Modal
      onClose={props.onClose}
      isOpen={props.isOpen}
      scrollBehavior={"inside"}
      size={"xl"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader></ModalHeader>
        <ModalCloseButton />
        <ModalBody alignItems={"center"} justifyContent={"center"}>
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
            <Button size={"xs"} variant={"ghost"} textColor={"blue.400"}>
              {"more"}
            </Button>
            <Stack spacing={2}>
              <HStack justifyContent={"center"} spacing={2}>
                <Button borderRadius={"md"}>{"再利用"}</Button>
                <Button borderRadius={"md"}>{"DL"}</Button>
                <Button borderRadius={"md"}>{"投稿"}</Button>
                <Button borderRadius={"md"}>{"一部修正"}</Button>
                <Button borderRadius={"md"}>{"URL"}</Button>
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
  )
}
