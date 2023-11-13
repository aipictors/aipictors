"use client"

import { Stack } from "@chakra-ui/react"

type Props = {
  children: React.ReactNode
}

const StickersLayout: React.FC<Props> = (props) => {
  return (
    <Stack pb={4} overflowX={"hidden"}>
      {props.children}
    </Stack>
  )
}

export default StickersLayout
