"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { Button } from "@chakra-ui/react"

type Props = ButtonProps

export const PromptonRequestButton = (props: Props) => {
  return (
    <Button colorScheme="orange" borderRadius={"full"} {...props}>
      {"支援"}
    </Button>
  )
}
