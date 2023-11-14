"use client"

import { Button, HStack, Image, Stack, Text } from "@chakra-ui/react"
import { Share } from "lucide-react"

export const SensitiveAlbumArticleHeader = () => {
  return (
    <Stack>
      <Image
        src="https://bit.ly/dan-abramov"
        alt="Dan Abramov"
        boxSize={"sm"}
        borderRadius={"md"}
      />
      <HStack justifyContent={"space-between"}>
        <Text>{"タイトル"}</Text>
        <Button
          leftIcon={<Share />}
          borderRadius={"full"}
          colorScheme="primary"
          size={"xs"}
        >
          {"Twitterでシェア"}
        </Button>
      </HStack>
    </Stack>
  )
}
