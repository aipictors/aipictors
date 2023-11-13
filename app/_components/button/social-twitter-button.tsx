"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { Icon, IconButton } from "@chakra-ui/react"
import React from "react"
import { TbBrandX } from "react-icons/tb"

type Props = ButtonProps

export const SocialTwitterButton: React.FC<Props> = (props) => {
  return (
    <IconButton
      aria-label={"twitter"}
      borderRadius={"full"}
      size={"sm"}
      icon={<Icon as={TbBrandX} />}
      {...props}
    />
  )
}
