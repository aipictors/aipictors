"use client"
import { Stack } from "@chakra-ui/react"

type Props = {
  children: React.ReactNode
}

export const MainLayout: React.FC<Props> = (props) => {
  return (
    <Stack overflowX={"hidden"} px={4} w={"100%"}>
      {props.children}
    </Stack>
  )
}
