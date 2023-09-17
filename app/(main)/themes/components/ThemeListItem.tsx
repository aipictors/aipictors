"use client"
import { Box, Text } from "@chakra-ui/react"
import Link from "next/link"
import type { FC } from "react"

type Props = {
  year: number
  month: number
  day: number | null
  title: string | null
}

export const ThemeListItem: FC<Props> = (props) => {
  return (
    <Box h={24}>
      <Link href={`/themes/${props.year}/${props.month}/${props.day}`}>
        <Text>{props.title}</Text>
      </Link>
    </Box>
  )
}
