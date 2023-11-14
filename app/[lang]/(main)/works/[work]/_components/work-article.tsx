"use client"

import type { WorkQuery } from "@/__generated__/apollo"
import { WorkAction } from "@/app/[lang]/(main)/works/[work]/_components/work-action"
import { WorkImageView } from "@/app/[lang]/(main)/works/[work]/_components/work-image-view"
import { WorkUser } from "@/app/[lang]/(main)/works/[work]/_components/work-user"
import { toDateTimeText } from "@/app/_utils/to-date-time-text"
import { Avatar, Button, HStack, Image, Stack, Text } from "@chakra-ui/react"

type Props = {
  work: NonNullable<WorkQuery["work"]>
}

export const WorkArticle = (props: Props) => {
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      alignItems={"flex-start"}
      overflow={"hidden"}
    >
      <Stack as="article" flex={1}>
        <WorkImageView
          workImageURL={props.work.imageURL}
          subWorkImageURLs={props.work.subWorks.map((subWork) => {
            return subWork.image.downloadURL
          })}
        />
        <WorkAction workLikesCount={props.work.likesCount} />
        <Text fontSize={"lg"} fontWeight={"bold"}>
          {props.work.title}
        </Text>
        <Text fontSize={"xs"}>{"CustomModel(その他)"}</Text>
        <Text fontSize={"sm"}>{toDateTimeText(props.work.createdAt)}</Text>
        <Text fontSize={"sm"}>{"デイリー入賞"}</Text>
        {props.work.dailyTheme && (
          <HStack>
            <Text fontSize={"sm"}>{"参加お題:"}</Text>
            <Button borderRadius={"full"} size={"sm"} variant={"outline"}>
              {props.work.dailyTheme.title}
            </Button>
          </HStack>
        )}
        <HStack>
          {props.work.tagNames.map((tagName) => (
            <Button
              key={tagName}
              borderRadius={"full"}
              size={"sm"}
              variant={"outline"}
            >
              {`#${tagName}`}
            </Button>
          ))}
        </HStack>
        <Text>{props.work.description}</Text>
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
              src={work.largeThumbnailImageURL}
            />
          ))}
        </HStack>
      </Stack>
      <WorkUser
        userName={props.work.user.name}
        userIconImageURL={props.work.user.iconImage?.downloadURL}
        userFollowersCount={props.work.user.followersCount}
        userBiography={props.work.user.biography}
        userPromptonId={props.work.user.promptonUser?.id}
        userWorksCount={props.work.user.worksCount}
      />
    </Stack>
  )
}
