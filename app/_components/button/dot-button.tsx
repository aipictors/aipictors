"use client"

import { IconButton } from "@chakra-ui/react"
import { MoreHorizontal } from "lucide-react"

type Props = {
  onClick(): void
}

export const DotButton = (props: Props) => {
  return (
    <IconButton
      aria-label="menu"
      icon={<MoreHorizontal />}
      size={"sm"}
      onClick={props.onClick}
    />
  )
}
