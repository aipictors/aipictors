"use client"

import {
  HStack,
  Text,
  Divider,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react"
import { FolloweeListItem } from "app/(main)/viewer/followees/components/FolloweeListItem"

export const MainViewerFollowers: React.FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"フォローされているユーザ"}
        </Text>
        <Stack>
          <Alert status="info" borderRadius={"md"}>
            <AlertIcon />
            <AlertTitle>{"フォローされているユーザはいません"}</AlertTitle>
          </Alert>
        </Stack>
        <Stack divider={<Divider />} spacing={0}>
          <FolloweeListItem />
          <FolloweeListItem />
          <FolloweeListItem />
        </Stack>
      </Stack>
    </HStack>
  )
}
