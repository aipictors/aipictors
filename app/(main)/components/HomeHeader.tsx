"use client"
import {
  Avatar,
  Box,
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  Link,
  useColorModeValue,
} from "@chakra-ui/react"
import React from "react"
import { TbMenu2, TbBellFilled, TbFolderFilled, TbSearch } from "react-icons/tb"
import { HomeUserNavigationButton } from "app/(main)/components/HomeUserNavigationButton"

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
        aria-label={"メニュー"}
        bgColor={"#fff0"}
        borderRadius={"full"}
        _hover={{ bgColor: "gray.700" }}
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
