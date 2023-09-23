"use client"

import { useSuspenseQuery } from "@apollo/client"
import {
  HStack,
  Text,
  Divider,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react"
import { useContext } from "react"
import type {
  UserFollowersQuery,
  UserFollowersQueryVariables,
} from "__generated__/apollo"
import { UserFollowersDocument } from "__generated__/apollo"
import { FolloweeListItem } from "app/(main)/viewer/followees/components/FolloweeListItem"
import { AppContext } from "app/contexts/appContext"

export const MainViewerFollowers: React.FC = () => {
  const appContext = useContext(AppContext)

  const { data = null } = useSuspenseQuery<
    UserFollowersQuery,
    UserFollowersQueryVariables
  >(UserFollowersDocument, {
    skip: appContext.isLoading,
    variables: { user_id: appContext.userId!, offset: 0, limit: 128 },
  })

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
