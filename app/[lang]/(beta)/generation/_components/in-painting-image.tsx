"use client"

import { HStack, Image } from "@chakra-ui/react"

export const InPaintingImage = () => {
  return (
    <HStack justifyContent={"center"}>
      <Image
        src="https://source.unsplash.com/random/800x600"
        alt=""
        boxSize={"xl"}
      />
    </HStack>
  )
}
