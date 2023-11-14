"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { IconButton } from "@chakra-ui/react"
import { Mail } from "lucide-react"

type Props = ButtonProps

export const LinkEmailButton = (props: Props) => {
  return (
    <IconButton
      aria-label={"email"}
      borderRadius={"full"}
      size={"sm"}
      icon={<Mail />}
      {...props}
    />
  )
}
