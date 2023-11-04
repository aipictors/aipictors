"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { Button } from "@chakra-ui/react"
import React from "react"

type Props = ButtonProps

export const FollowButton: React.FC<Props> = (props) => {
  return (
    <Button colorScheme="primary" borderRadius={"full"} size={"sm"} {...props}>
      {"フォローする"}
    </Button>
  )
}
