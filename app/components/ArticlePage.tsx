"use client"

import { Stack } from "@chakra-ui/react"

type Props = {
  children: React.ReactNode
}

export const ArticlePage: React.FC<Props> = (props) => {
  return (
    <Stack px={4} w={"100%"} maxW={"container.xl"} mx={"auto"}>
      {props.children}
    </Stack>
  )
}
