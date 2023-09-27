"use client"
import type { ButtonProps } from "@chakra-ui/react"
import { Icon, IconButton } from "@chakra-ui/react"
import React from "react"
import { TbBrandInstagram } from "react-icons/tb"

type Props = ButtonProps

export const SocialInstagramButton: React.FC<Props> = (props) => {
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
