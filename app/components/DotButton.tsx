"use client"
import { IconButton } from "@chakra-ui/react"
import React from "react"
import { TbDots } from "react-icons/tb"

export const DotButton: React.FC = () => {
  return <IconButton aria-label="menu" icon={<TbDots />} size={"sm"} />
}
