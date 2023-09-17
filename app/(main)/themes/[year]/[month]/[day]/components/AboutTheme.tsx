"use client"
import { Text } from "@chakra-ui/react"
import type { FC } from "react"

type Props = {
  title: string
}

export const AboutTheme: FC<Props> = (props) => {
  return <Text>{props.title}</Text>
}
