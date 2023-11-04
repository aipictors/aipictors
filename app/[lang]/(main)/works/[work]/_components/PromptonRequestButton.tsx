"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { Button } from "@chakra-ui/react"
import React from "react"

type Props = ButtonProps

export const PromptonRequestButton: React.FC<Props> = (props) => {
  return (
    <Button colorScheme="orange" borderRadius={"full"} {...props}>
      {"支援"}
    </Button>
  )
}
