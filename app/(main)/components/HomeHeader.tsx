"use client"
import {
  Avatar,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  useColorModeValue,
} from "@chakra-ui/react"
import Link from "next/link"
import React from "react"
import { TbMenu2, TbBellFilled, TbFolderFilled, TbSearch } from "react-icons/tb"
import { HomeUserNavigationButton } from "app/(main)/components/HomeUserNavigationButton"
import { Config } from "config"

type HomeHeaderProps = {
  onOpenNavigation?: () => void
}

export const HomeHeader: React.FC<HomeHeaderProps> = (props) => {
  const backgroundColor = useColorModeValue("white", "gray.800")

  return (
    <HStack
      p={4}
      spacing={4}
      position={"sticky"}
      top={0}
      bg={backgroundColor}
      zIndex={100}
    >
      <IconButton
        variant={"ghost"}
        aria-label={"メニュー"}
        borderRadius={"full"}
        onClick={props.onOpenNavigation}
        icon={<Icon as={TbMenu2} />}
      />
      <Box display={{ base: "none", md: "block" }}>
        <Link href={"/"}>
          <Avatar src={"/icon.png"} size={"sm"} />
        </Link>
      </Box>
      <Box w={"100%"} display={{ base: "none", md: "block" }}>
        <Input placeholder={"作品を検索"} size={"sm"} borderRadius={"full"} />
      </Box>
      <IconButton
        marginLeft={"auto"}
        size={"sm"}
        display={{ base: "block", md: "none" }}
        borderRadius={"full"}
        icon={<Icon as={TbSearch} />}
        aria-label={"Search"}
      />
      <HStack>
        <Button
          isDisabled={Config.isReleaseMode}
          as={Link}
          href={"/generation"}
          size={"sm"}
          borderRadius={"full"}
        >
          {"生成"}
        </Button>
        <Button
          isDisabled={Config.isReleaseMode}
          as={Link}
          href={"/new/image"}
          size={"sm"}
          borderRadius={"full"}
        >
          {"投稿"}
        </Button>
        <IconButton
          isDisabled={Config.isReleaseMode}
          as={Link}
          href={"/viewer/albums"}
          size={"sm"}
          borderRadius={"full"}
          aria-label={"フォルダ"}
          fontSize={"lg"}
          icon={<TbFolderFilled />}
        />
        <IconButton
          isDisabled
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
