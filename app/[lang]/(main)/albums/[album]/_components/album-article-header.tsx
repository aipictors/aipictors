"use client"

import { AlbumQuery } from "@/__generated__/apollo"
import { Button, HStack, Icon, Image, Stack, Text } from "@chakra-ui/react"
import { TbShare2 } from "react-icons/tb"

type Props = {
  albumQuery: AlbumQuery
}

export const AlbumArticleHeader = (props: Props) => {
  return (
    <Stack>
      <Image
        src={props.albumQuery.album?.thumbnailImage?.downloadURL!}
        alt={props.albumQuery.album?.title!}
        borderRadius={"md"}
      />
      <HStack justifyContent={"space-between"}>
        <Text>{props.albumQuery.album?.title}</Text>
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
