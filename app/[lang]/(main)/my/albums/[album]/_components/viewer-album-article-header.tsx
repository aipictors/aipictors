"use client"

import { Button, HStack, Icon, IconButton, Stack, Text } from "@chakra-ui/react"
import { TbPencil, TbPlus, TbShare2 } from "react-icons/tb"

export const ViewerAlbumArticleHeader = () => {
  return (
    <Stack spacing={4}>
      <HStack justifyContent={"space-between"}>
        <IconButton
          size={"lg"}
          aria-label={"メニュー"}
          borderRadius={"full"}
          icon={<Icon as={TbPencil} />}
        />
        <Button
          leftIcon={<Icon as={TbShare2} />}
          borderRadius={"full"}
          colorScheme="primary"
          size={"xs"}
        >
          {"Twitterでシェア"}
        </Button>
      </HStack>
      <Text fontSize={"sm"}> {"選択後、ドラッグで並び替えできます"}</Text>
      <HStack justifyContent={"center"}>
        <IconButton
          size={"lg"}
          aria-label={"メニュー"}
          borderRadius={"full"}
          icon={<Icon as={TbPlus} />}
        />
      </HStack>
      <HStack justifyContent={"space-between"} />
    </Stack>
  )
}
