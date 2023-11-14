"use client"

import { AlbumQuery } from "@/__generated__/apollo"
import { FollowButton } from "@/app/_components/button/follow-button"
import { Avatar, Card, CardBody, HStack, Stack, Text } from "@chakra-ui/react"

type Props = {
  albumQuery: AlbumQuery
}

export const AlbumWorkDescription = (props: Props) => {
  return (
    <Card overflow="hidden" variant="outline" size={"100%"}>
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
