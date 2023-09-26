"use client"
import { Button, HStack, Icon, IconButton, Text } from "@chakra-ui/react"
import {
  TbQuestionMark,
  TbHeartFilled,
  TbFolderFilled,
  TbShare2,
  TbDots,
} from "react-icons/tb"

type Props = {
  workLikesCount: number
}

export const WorkAction: React.FC<Props> = (props) => {
  return (
    <HStack justifyContent={"space-between"}>
      <HStack>
        <Button leftIcon={<Icon as={TbQuestionMark} />} borderRadius={"full"}>
          {"画像生成"}
        </Button>
      </HStack>
      <HStack>
        <Button leftIcon={<Icon as={TbHeartFilled} />} borderRadius={"full"}>
          <HStack spacing={2}>
            <Text>{"いいね"}</Text>
            <Text>{props.workLikesCount}</Text>
          </HStack>
        </Button>
        <IconButton
          aria-label={"フォルダに追加"}
          icon={<Icon as={TbFolderFilled} />}
          borderRadius={"full"}
        />
        <IconButton
          aria-label={"シェア"}
          icon={<Icon as={TbShare2} />}
          borderRadius={"full"}
        />
        <IconButton
          aria-label={"メニュー"}
          borderRadius={"full"}
          icon={<Icon as={TbDots} />}
        />
      </HStack>
    </HStack>
  )
}
