"use client"
import type { ButtonProps } from "@chakra-ui/react"
import { Icon, IconButton } from "@chakra-ui/react"
import React from "react"
import { TbExternalLink } from "react-icons/tb"

type Props = ButtonProps

export const LinkWebButton: React.FC<Props> = (props) => {
  return (
    <IconButton
      aria-label={"email"}
      borderRadius={"full"}
      size={"sm"}
      icon={<Icon as={TbExternalLink} />}
      {...props}
    />
  )
}
