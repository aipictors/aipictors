"use client"
import { Stack } from "@chakra-ui/react"
import { FC } from "react"

type Props = {
  children: React.ReactNode
}

export const MainLayout: FC<Props> = (props) => {
  return <Stack overflowX={"hidden"}>{props.children}</Stack>
}
