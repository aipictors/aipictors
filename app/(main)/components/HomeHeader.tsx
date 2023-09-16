"use client"
import { Avatar, Button, HStack, IconButton, Input } from "@chakra-ui/react"
import { FC } from "react"
import { TbBellFilled, TbFolderFilled } from "react-icons/tb"
import { HomeUserNavigationButton } from "app/(main)/components/HomeUserNavigationButton"

export const HomeHeader: FC = () => {
  return (
    <HStack
      p={4}
      spacing={4}
      position={"sticky"}
      top={0}
      bg={"gray.800"}
      zIndex={100}
    >
      <Avatar src={"/icon.png"} size={"sm"} />
      <Input placeholder={"作品を検索"} size={"sm"} borderRadius={"full"} />
      <HStack>
        <Button size={"sm"} borderRadius={"full"}>
          {"投稿"}
        </Button>
        <Button size={"sm"} borderRadius={"full"}>
          {"生成"}
        </Button>
        <IconButton
          size={"sm"}
          borderRadius={"full"}
          aria-label={"フォルダ"}
          fontSize={"lg"}
          icon={<TbFolderFilled />}
        />
        <IconButton
          size={"sm"}
          borderRadius={"full"}
          aria-label={"通知"}
          fontSize={"lg"}
          icon={<TbBellFilled />}
        />
        <HomeUserNavigationButton />
      </HStack>
    </HStack>
  )
}
