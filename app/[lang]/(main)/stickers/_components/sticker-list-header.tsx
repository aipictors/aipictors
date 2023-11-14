"use client"

import { AddStickerModal } from "@/app/[lang]/(main)/stickers/_components/add-sticker-modal"
import { IconButton, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { Plus } from "lucide-react"

export const StickerListHeader = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Stack maxW={"container.lg"} w={"100%"} p={4} spacing={8}>
        <Stack>
          <Text fontWeight={"bold"} fontSize={"2xl"}>
            {"AIイラストスタンプ広場"}
          </Text>
          <Text fontSize={"sm"}>
            {
              "作ったスタンプを公開したり、みんなの作ったスタンプをダウンロードして使ってみましょう！"
            }
          </Text>
        </Stack>
        <Stack alignItems={"center"}>
          <Text fontSize={"lg"}>{"自分で作ったスタンプを公開する"}</Text>
          <IconButton
            aria-label="previous month"
            icon={<Plus fontSize={"lg"} />}
            variant={"ghost"}
            borderRadius={"full"}
            onClick={onOpen}
          />
          <IconButton
            aria-label="previous month"
            icon={<Plus fontSize={"lg"} />}
            variant={"ghost"}
            borderRadius={"full"}
          >
            {"スタンプを作る"}
          </IconButton>
        </Stack>
      </Stack>
      <AddStickerModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
