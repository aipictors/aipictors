"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { Icon, IconButton } from "@chakra-ui/react"
import React from "react"
import { TbMail } from "react-icons/tb"

type Props = ButtonProps

export const LinkEmailButton: React.FC<Props> = (props) => {
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
