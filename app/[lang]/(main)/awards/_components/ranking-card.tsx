"use client"

import { Card, Image, Stack, Text } from "@chakra-ui/react"

type Props = {
  title?: string
  imageURL: string | null
  // work: {
  //   user: {
  //     name: string
  //     iconImage: {
  //       downloadURL: string | null
  //     } | null
  //   }
  // }
}

export const RankingCard = (props: Props) => (
  <Card>
    <Image
      src={props.imageURL ?? ""}
      alt={props.title ?? "no title"}
      borderRadius={"lg"}
      height={32}
      minH={32}
      objectFit="cover"
    />
    <Stack p={2} justifyContent={"space-between"} height={"100%"} spacing={1}>
      <Text fontSize={"sm"} fontWeight={"bold"}>
        {props.title ?? ""}
      </Text>
      {/* <UserAvatarLink
        userName={props.work.user.name}
        userIconImageURL={props.work.user.iconImage?.downloadURL ?? null}
      /> */}
    </Stack>
  </Card>
)
