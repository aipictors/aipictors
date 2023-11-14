"use client"

import { IconButton } from "@chakra-ui/react"

import { TbDots } from "react-icons/tb"

type Props = {
  onClick(): void
}

export const DotButton = (props: Props) => {
  return (
    <IconButton
      aria-label="menu"
      icon={<TbDots />}
      size={"sm"}
      onClick={props.onClick}
    />
  )
}
