"use client"
import { useSuspenseQuery } from "@apollo/client"
import {
  Avatar,
  Box,
  Button,
  Divider,
  HStack,
  Stack,
  Text,
  useInterval,
} from "@chakra-ui/react"
import type {
  ViewerMessageThreadsQuery,
  ViewerMessageThreadsQueryVariables,
} from "__generated__/apollo"
import { ViewerMessageThreadsDocument } from "__generated__/apollo"
import { toDateTimeText } from "app/utils/toDateTimeText"
import Link from "next/link"
import { startTransition } from "react"

export const MessageThreadList: React.FC = () => {
  const { data: threads, refetch } = useSuspenseQuery<
    ViewerMessageThreadsQuery,
    ViewerMessageThreadsQueryVariables
  >(ViewerMessageThreadsDocument, {
    variables: {
      limit: 124,
      offset: 0,
    },
  })

  useInterval(() => {
    startTransition(() => {
      refetch()
    })
  }, 4000)

  const messageThreads = threads.viewer?.messageThreads ?? []

  return (
    <Box
      as={"aside"}
      position={"sticky"}
      top={"64px"}
      h={"calc(100svh - 64px)"}
      minW={64}
      maxW={64}
      overflowY={"auto"}
      borderLeftWidth={1}
      borderRightWidth={1}
    >
      <Stack divider={<Divider />} spacing={0}>
        {messageThreads.map((messageThread) => (
          <Button
            as={Link}
            variant={"ghost"}
            h={"auto"}
            justifyContent={"flex-start"}
            p={0}
            key={messageThread.id}
            href={`/messages/${messageThread.id}`}
            borderRadius={0}
          >
            <Stack px={4} py={4} spacing={2} overflow={"hidden"}>
              <HStack>
                <Avatar
                  src={messageThread.recipient.iconImage?.downloadURL}
                  size={"xs"}
                />
                <Text fontWeight={"bold"}>{messageThread.recipient.name}</Text>
              </HStack>
              <Stack spacing={1}>
                <Text
                  lineHeight={1}
                  textOverflow={"ellipsis"}
                  overflow={"hidden"}
                >
                  {messageThread.latestMessage.text}
                </Text>
                <Text fontSize={"xs"} opacity={0.8}>
                  {toDateTimeText(messageThread.latestMessage.createdAt)}
                </Text>
              </Stack>
            </Stack>
          </Button>
        ))}
      </Stack>
    </Box>
  )
}
