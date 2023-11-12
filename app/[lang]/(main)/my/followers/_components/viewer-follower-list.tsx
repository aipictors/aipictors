"use client"

import type {
  UserFollowersQuery,
  UserFollowersQueryVariables,
} from "@/__generated__/apollo"
import { UserFollowersDocument } from "@/__generated__/apollo"
import { FolloweeListItem } from "@/app/[lang]/(main)/my/followees/_components/followee-list-item"
import { AppContext } from "@/app/_contexts/app-context"
import { skipToken, useSuspenseQuery } from "@apollo/client"
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Divider,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useContext } from "react"

export const ViewerFollowerList: React.FC = () => {
  const appContext = useContext(AppContext)

  const { data = null } = useSuspenseQuery<
    UserFollowersQuery,
    UserFollowersQueryVariables
  >(
    UserFollowersDocument,
    appContext.isLoading || appContext.userId === null
      ? skipToken
      : {
          variables: {
            user_id: appContext.userId,
            offset: 0,
            limit: 128,
          },
        },
  )

  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"lg"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"フォロワー"}
        </Text>
        {data?.user?.followers?.length === 0 && (
          <Alert status="info" borderRadius={"md"}>
            <AlertIcon />
            <AlertTitle>{"誰もあなたをフォローしていません"}</AlertTitle>
          </Alert>
        )}
        <Stack divider={<Divider />} spacing={0}>
          {data?.user?.followers?.map((follower) => (
            <FolloweeListItem
              key={follower.id}
              name={follower.name}
              imageURL={follower.iconImage?.downloadURL}
            />
          ))}
        </Stack>
      </Stack>
    </HStack>
  )
}
