"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { Icon, IconButton } from "@chakra-ui/react"

import { TbExternalLink } from "react-icons/tb"

type Props = ButtonProps

export const LinkWebButton = (props: Props) => {
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
