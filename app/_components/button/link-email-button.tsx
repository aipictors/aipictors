"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { Icon, IconButton } from "@chakra-ui/react"

import { TbMail } from "react-icons/tb"

type Props = ButtonProps

export const LinkEmailButton = (props: Props) => {
  return (
    <IconButton
      aria-label={"email"}
      borderRadius={"full"}
      size={"sm"}
      icon={<Icon as={TbMail} />}
      {...props}
    />
  )
}
