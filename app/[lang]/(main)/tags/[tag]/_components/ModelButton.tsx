"use client"

import { Button, Skeleton } from "@chakra-ui/react"

export const ModelButton: React.FC = () => {
  return (
    <Button borderRadius={"full"}>
      <Skeleton w={16} h={4} />
    </Button>
  )
}
