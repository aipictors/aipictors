"use client"
import {
  Avatar,
  Box,
  HStack,
  Icon,
  IconButton,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import { BetaUserNavigationButton } from "app/[lang]/(main)/_components/BetaUserNavigationButton"
import Link from "next/link"
import React from "react"
import { TbBellFilled, TbMenu2 } from "react-icons/tb"

type Props = {
  title?: string
  onOpenNavigation?: () => void
}

export const BetaHeader: React.FC<Props> = (props) => {
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
        <Text fontWeight={"bold"}>{props.title ?? "Beta"}</Text>
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
