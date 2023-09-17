"use client"
import { Stack } from "@chakra-ui/react"
import type { FC } from "react"

type Props = {
  children: React.ReactNode
}

export const MainLayout: FC<Props> = (props) => {
  return (
    <Stack overflowX={"hidden"} pb={4}>
      {props.children}
    </Stack>
  )
}
