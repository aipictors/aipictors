"use client"
import {
  Avatar,
  Box,
  HStack,
  Icon,
  IconButton,
  useColorModeValue,
  Text,
} from "@chakra-ui/react"
import Link from "next/link"
import React from "react"
import { TbMenu2, TbBellFilled } from "react-icons/tb"
import { BetaUserNavigationButton } from "app/(main)/components/BetaUserNavigationButton"

type HomeHeaderProps = {
  onOpenNavigation?: () => void
}

export const BetaHeader: React.FC<HomeHeaderProps> = (props) => {
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
      <Box>
        <Link href={"https://www.aipictors.com"}>
          <Avatar src={"/icon.png"} size={"sm"} />
        </Link>
      </Box>
      <Box w={"100%"}>
        <Text fontWeight={"bold"}>{"Beta"}</Text>
      </Box>
      <HStack>
        <IconButton
          isDisabled
          size={"sm"}
          borderRadius={"full"}
          aria-label={"通知"}
          fontSize={"lg"}
          icon={<TbBellFilled />}
        />
        <BetaUserNavigationButton />
      </HStack>
    </HStack>
  )
}
