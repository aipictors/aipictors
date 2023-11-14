"use client"

import { Box, Button, Text, useColorModeValue } from "@chakra-ui/react"
import Link from "next/link"

type Props = {
  year: number
  month: number
  day: number | null
  title: string | null
}

export const ThemeListItem = (props: Props) => {
  const backgroundColor = useColorModeValue("gray.100", "gray.900")

  if (props.title === null) {
    return (
      <Box
        display={{ base: "none", lg: "block" }}
        h={24}
        bgColor={backgroundColor}
        borderRadius={"md"}
        p={4}
      />
    )
  }

  return (
    <Link href={`/themes/${props.year}/${props.month}/${props.day}`}>
      <Button
        h={24}
        justifyContent={"center"}
        alignItems={"center"}
        borderRadius={"md"}
        p={4}
        w={"100%"}
      >
        <Text display={"block"} w={"fit-content"} fontSize={"sm"}>
          {props.day}
        </Text>
        <Text display={"block"} w={"fit-content"} fontSize={"sm"}>
          {props.title}
        </Text>
      </Button>
    </Link>
  )
}
