"use client"

import {
  Button,
  Icon,
  IconButton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { AddStickerModal } from "app/[lang]/(main)/stickers/_components/AddStickerModal"
import { TbPlus } from "react-icons/tb"

export const StickerListHeader: React.FC = () => {
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
            icon={<Icon as={TbPlus} fontSize={"lg"} />}
            variant={"ghost"}
            borderRadius={"full"}
            onClick={onOpen}
          />
          <Button
            aria-label="previous month"
            leftIcon={<Icon as={TbPlus} fontSize={"lg"} />}
            variant={"ghost"}
            borderRadius={"full"}
          >
            {"スタンプを作る"}
          </Button>
        </Stack>
      </Stack>
      <AddStickerModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
