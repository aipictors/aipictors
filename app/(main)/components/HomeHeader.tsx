"use client"
import {
  Avatar,
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Link,
} from "@chakra-ui/react"
import { TbBellFilled, TbFolderFilled } from "react-icons/tb"
import { HomeUserNavigationButton } from "app/(main)/components/HomeUserNavigationButton"
import { HamburgerIcon, SearchIcon } from "@chakra-ui/icons"
import React from "react"

type HomeHeaderProps = {
  changeHomeNavigationState?: () => void
}

export const HomeHeader: React.FC<HomeHeaderProps> = (props) => {
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const { changeHomeNavigationState } = props

  return (
    <HStack
      p={4}
      spacing={4}
      position={"sticky"}
      top={0}
      bg={"gray.800"}
      zIndex={100}
    >
      <Button
        ref={btnRef}
        bgColor={"#fff0"}
        borderRadius={"full"}
        _hover={{ bgColor: "gray.700" }}
        onClick={changeHomeNavigationState}
      >
        <HamburgerIcon color="gray.500" />
      </Button>
      <Box w={"100%"} display={{ base: "none", md: "flex" }}>
        <Link href={"/"} marginRight={"8px"}>
          <Avatar src={"/icon.png"} size={"sm"} />
        </Link>
        <Input placeholder={"作品を検索"} size={"sm"} borderRadius={"full"} />
      </Box>
      <IconButton
        marginLeft={"auto"}
        size={"sm"}
        display={{ base: "block", md: "none" }}
        borderRadius={"full"}
        icon={<SearchIcon />}
        aria-label={"Search"}
      />
      <HStack>
        <Link href={"/new/image"}>
          <Button size={"sm"} borderRadius={"full"}>
            {"投稿"}
          </Button>
        </Link>
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
