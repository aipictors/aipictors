"use client"
import { Avatar, Button, HStack, Image, Stack, Text } from "@chakra-ui/react"

import type { WorkQuery } from "__generated__/apollo"
import { WorkAction } from "app/(main)/works/[work]/components/WorkAction"
import { WorkImageView } from "app/(main)/works/[work]/components/WorkImageView"
import { WorkUser } from "app/(main)/works/[work]/components/WorkUser"
import { toDateTimeText } from "app/utils/toDateTimeText"

type Props = {
  work: NonNullable<WorkQuery["work"]>
}

export const WorkArticle: React.FC<Props> = (props) => {
  console.log(props.work.user)
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      alignItems={"flex-start"}
      overflow={"hidden"}
    >
      <Stack as="article" flex={1}>
        <WorkImageView
          workImageURL={props.work.image?.downloadURL}
          subWorkImageURLs={props.work.subWorks.map((subWork) => {
            return subWork.image.downloadURL
          })}
        />
        <WorkAction workLikesCount={props.work.likesCount} />
        <Text fontSize={"lg"} fontWeight={"bold"}>
          {props.work.title}
        </Text>
        <Text>{props.work.description}</Text>
        <Text fontSize={"sm"}>{toDateTimeText(props.work.createdAt)}</Text>
        <Text>{props.work.tagNames}</Text>
        <HStack justifyContent={"space-between"}>
          <HStack>
            <Avatar src={props.work.user.iconImage?.downloadURL} />
            <Text>{props.work.user.name}</Text>
            <Button colorScheme={"primary"} borderRadius={"full"} size={"sm"}>
              {"フォローする"}
            </Button>
          </HStack>
          <Text fontSize={"sm"}>{"一覧をダイアログで見る"}</Text>
        </HStack>
        <HStack overflowX={"auto"}>
          {props.work.user.works.map((work) => (
            <Image
              key={work.id}
              h={40}
              borderRadius={"md"}
              alt={""}
              src={work.thumbnailImage?.downloadURL}
            />
          ))}
        </HStack>
      </Stack>
      <WorkUser
        userName={props.work.user.name}
        userIconImageURL={props.work.user.iconImage?.downloadURL}
        userFollowersCount={props.work.user.followersCount}
        userBiography={props.work.user.biography}
      />
    </Stack>
  )
}
