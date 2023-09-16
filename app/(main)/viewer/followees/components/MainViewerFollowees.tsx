"use client"
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Divider,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react"
import { FC } from "react"
import { FolloweeListItem } from "app/(main)/viewer/followees/components/FolloweeListItem"

export const MainViewerFollowees: FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"フォローしているユーザ"}
        </Text>
        <Stack>
          <Alert status="info" borderRadius={"md"}>
            <AlertIcon />
            <AlertTitle>{"フォローしているユーザはいません"}</AlertTitle>
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
