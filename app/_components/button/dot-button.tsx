"use client"

import { IconButton } from "@chakra-ui/react"
import React from "react"
import { TbDots } from "react-icons/tb"

type Props = {
  onClick(): void
}

export const DotButton: React.FC<Props> = (props) => {
  return (
    <IconButton
      aria-label="menu"
      icon={<TbDots />}
      size={"sm"}
      onClick={props.onClick}
    />
  )
}
