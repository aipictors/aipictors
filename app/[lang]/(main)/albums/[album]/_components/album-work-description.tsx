"use client"

import { Avatar, Card, CardBody, HStack, Stack, Text } from "@chakra-ui/react"
import { AlbumQuery } from "__generated__/apollo"
import { FollowButton } from "app/_components/button/follow-button"

type Props = {
  albumQuery: AlbumQuery
}

export const AlbumWorkDescription: React.FC<Props> = (props) => {
  return (
    <Card overflow="hidden" variant="outline" size={"lg"}>
      <CardBody>
        <Stack spacing={4}>
          <HStack>
            <Avatar
              src={props.albumQuery.album?.thumbnailImage?.downloadURL}
              size={"sm"}
            />
            <Text>{props.albumQuery.album?.user.name}</Text>
          </HStack>
          <HStack justifyContent={"flex-start"}>
            <FollowButton size={"xs"} />
          </HStack>
          <Text>{props.albumQuery.album?.description}</Text>
        </Stack>
      </CardBody>
    </Card>
  )
}
