"use client"

import { Text } from "@chakra-ui/react"

type Props = {
  title: string
}

export const AboutTheme: React.FC<Props> = (props) => {
  return <Text>{props.title}</Text>
}
