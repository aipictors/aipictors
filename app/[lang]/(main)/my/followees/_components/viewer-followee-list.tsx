"use client"

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
import type {
  UserFolloweesQuery,
  UserFolloweesQueryVariables,
} from "__generated__/apollo"
import { UserFolloweesDocument } from "__generated__/apollo"
import { FolloweeListItem } from "app/[lang]/(main)/my/followees/_components/followee-list-item"
import { AppContext } from "app/_contexts/app-context"
import { useContext } from "react"

export const ViewerFolloweeList: React.FC = () => {
  const appContext = useContext(AppContext)

  const { data = null } = useSuspenseQuery<
    UserFolloweesQuery,
    UserFolloweesQueryVariables
  >(
    UserFolloweesDocument,
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
          {"フォローしているユーザ"}
        </Text>
        {data?.user?.followees?.length === 0 && (
          <Alert status="info" borderRadius={"md"}>
            <AlertIcon />
            <AlertTitle>{"フォローしているユーザはいません"}</AlertTitle>
          </Alert>
        )}
        <Stack divider={<Divider />} spacing={0}>
          {data?.user?.followees?.map((followee) => (
            <FolloweeListItem
              key={followee.id}
              name={followee.name}
              imageURL={followee.iconImage?.downloadURL}
            />
          ))}
        </Stack>
      </Stack>
    </HStack>
  )
}
