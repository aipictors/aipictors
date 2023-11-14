"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { Icon, IconButton } from "@chakra-ui/react"

import { TbBrandInstagram } from "react-icons/tb"

type Props = ButtonProps

export const SocialInstagramButton = (props: Props) => {
  return (
    <IconButton
      aria-label={"instagram"}
      borderRadius={"full"}
      size={"sm"}
      icon={<Icon as={TbBrandInstagram} />}
      {...props}
    />
  )
}
