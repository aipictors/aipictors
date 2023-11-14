"use client"
import { Button, HStack, IconButton, Text } from "@chakra-ui/react"
import { Folder, Heart, HelpCircle, MoreHorizontal, Share } from "lucide-react"

type Props = {
  workLikesCount: number
}

export const SensitiveWorkAction = (props: Props) => {
  return (
    <HStack justifyContent={"space-between"}>
      <HStack>
        <Button leftIcon={<HelpCircle />} borderRadius={"full"}>
          {"画像生成"}
        </Button>
      </HStack>
      <HStack>
        <Button leftIcon={<Heart />} borderRadius={"full"}>
          <HStack spacing={2}>
            <Text>{"いいね"}</Text>
            <Text>{props.workLikesCount}</Text>
          </HStack>
        </Button>
        <IconButton
          aria-label={"フォルダに追加"}
          icon={<Folder />}
          borderRadius={"full"}
        />
        <IconButton
          aria-label={"シェア"}
          icon={<Share />}
          borderRadius={"full"}
        />
        <IconButton
          aria-label={"メニュー"}
          borderRadius={"full"}
          icon={<MoreHorizontal />}
        />
      </HStack>
    </HStack>
  )
}
