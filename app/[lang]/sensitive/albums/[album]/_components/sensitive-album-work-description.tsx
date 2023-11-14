"use client"

import { FollowButton } from "@/app/_components/button/follow-button"
import { Avatar, Card, CardBody, HStack, Stack, Text } from "@chakra-ui/react"

export const SensitiveAlbumWorkDescription = () => {
  return (
    <Card overflow="hidden" variant="outline" size={"lg"}>
      <CardBody>
        <Stack spacing={4}>
          <HStack>
            <Avatar src="https://bit.ly/broken-link" size={"sm"} />
            <Text>{"name"}</Text>
          </HStack>
          <HStack justifyContent={"flex-start"}>
            <FollowButton size={"xs"} />
          </HStack>
          <Text>{"説明"}</Text>
        </Stack>
      </CardBody>
    </Card>
  )
}
