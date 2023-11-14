"use client"

import { Button, Card, HStack, Image, Text } from "@chakra-ui/react"
import { Trash2 } from "lucide-react"

export const ViewerAlbum = () => {
  return (
    <Card>
      <Button
        p={0}
        h={"auto"}
        overflow={"hidden"}
        variant={"outline"}
        borderWidth={2}
      >
        <Image
          src="https://source.unsplash.com/random/800x600"
          alt=""
          boxSize={"unset"}
        />
      </Button>
      <HStack px={2} justifyContent={"space-between"}>
        <Text>{"タイトル"}</Text>
        <Trash2 />
      </HStack>
    </Card>
  )
}
