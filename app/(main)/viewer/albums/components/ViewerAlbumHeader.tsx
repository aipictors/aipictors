"use client"
import {
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { TbPlus } from "react-icons/tb"
import { ViewerAlbumAddModal } from "app/(main)/viewer/albums/components/ViewerAlbumAddModal"

export const ViewerAlbumHeader: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Stack>
        <Text>{"投稿作品をシリーズにまとめてシェアしてみよう！"}</Text>
        <HStack justifyContent={"center"}>
          <IconButton
            size={"lg"}
            aria-label={"メニュー"}
            borderRadius={"full"}
            icon={<Icon as={TbPlus} />}
            onClick={onOpen}
          />
        </HStack>
      </Stack>
      <ViewerAlbumAddModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
