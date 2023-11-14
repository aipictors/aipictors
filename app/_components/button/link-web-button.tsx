"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { IconButton } from "@chakra-ui/react"
import { ExternalLink } from "lucide-react"

type Props = ButtonProps

export const LinkWebButton = (props: Props) => {
  return (
    <IconButton
      aria-label={"email"}
      borderRadius={"full"}
      size={"sm"}
      icon={<ExternalLink />}
      {...props}
    />
  )
}
