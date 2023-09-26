"use client"

import { HStack } from "@chakra-ui/react"

type Props = {
  children: React.ReactNode
}

export const ColumnPage: React.FC<Props> = (props) => {
  return <HStack spacing={4}>{props.children}</HStack>
}
