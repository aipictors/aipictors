"use client"

import type { ButtonProps } from "@chakra-ui/react"
import { Button } from "@chakra-ui/react"

type Props = ButtonProps

export const FollowButton = (props: Props) => {
  return (
    <Button colorScheme="primary" borderRadius={"full"} size={"sm"} {...props}>
      {"フォローする"}
    </Button>
  )
}
