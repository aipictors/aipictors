"use client"

import { Text } from "@chakra-ui/react"

type Props = {
  title: string
}

export const AboutTheme = (props: Props) => {
  return <Text>{props.title}</Text>
}
