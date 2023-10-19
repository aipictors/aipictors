"use client"
import { IconButton } from "@chakra-ui/react"
import React from "react"
import { TbShare2 } from "react-icons/tb"

export const ShareButton: React.FC = () => {
  return <IconButton aria-label="share" icon={<TbShare2 />} size={"sm"} />
}
