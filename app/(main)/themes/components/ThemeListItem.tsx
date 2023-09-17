"use client"
import { Box, Stack, Text } from "@chakra-ui/react"
import Link from "next/link"
import type { FC } from "react"

type Props = {
  year: number
  month: number
  day: number | null
  title: string | null
}

export const ThemeListItem: FC<Props> = (props) => {
  if (props.title === null) {
    return (
      <Box
        display={{ base: "none", lg: "block" }}
        h={24}
        bgColor={"gray.900"}
        borderRadius={"md"}
        p={4}
      />
    )
  }

  return (
    <Link href={`/themes/${props.year}/${props.month}/${props.day}`}>
      <Stack
        h={24}
        justifyContent={"center"}
        alignItems={"center"}
        bgColor={"gray.900"}
        borderRadius={"md"}
        _hover={{ bgColor: "gray.700" }}
        p={4}
      >
        <Text display={"block"} w={"fit-content"} fontSize={"sm"}>
          {props.title}
        </Text>
      </Stack>
    </Link>
  )
}
