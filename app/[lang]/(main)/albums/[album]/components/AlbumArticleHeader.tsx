"use client"
import { Stack, Text, Image, Button, HStack, Icon } from "@chakra-ui/react"
import { TbShare2 } from "react-icons/tb"

export const AlbumArticleHeader: React.FC = () => {
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
          leftIcon={<Icon as={TbShare2} />}
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
