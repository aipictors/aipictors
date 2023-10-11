"use client"
import { useSuspenseQuery } from "@apollo/client"
import { Box, Text, Stack, Divider, Button } from "@chakra-ui/react"
import Link from "next/link"
import type {
  ViewerMessageThreadsQuery,
  ViewerMessageThreadsQueryVariables,
} from "__generated__/apollo"
import { ViewerMessageThreadsDocument } from "__generated__/apollo"
import { toDateTimeText } from "app/utils/toDateTimeText"

export const MessageThreadList: React.FC = () => {
  const { data: threads } = useSuspenseQuery<
    ViewerMessageThreadsQuery,
    ViewerMessageThreadsQueryVariables
  >(ViewerMessageThreadsDocument, {
    variables: {
      limit: 124,
      offset: 0,
    },
  })

  // useInterval(() => {
  //   startTransition(() => {
  //     refetch()
  //   })
  // }, 4000)

  const messageThreads = threads.viewer?.messageThreads ?? []

  return (
    <Box
      as={"aside"}
      position={"sticky"}
      top={"64px"}
      h={"calc(100svh - 64px)"}
      minW={64}
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
          >
            <Stack px={4} py={2} spacing={1} overflow={"hidden"}>
              <Text fontWeight={"bold"}>{messageThread.recipient.name}</Text>
              <Stack spacing={2}>
                <Text whiteSpace={"pre-wrap"} lineHeight={1}>
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
