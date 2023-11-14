"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { Icon, IconButton } from "@chakra-ui/react"

import { TbBrandX } from "react-icons/tb"

type Props = ButtonProps

export const SocialTwitterButton = (props: Props) => {
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
