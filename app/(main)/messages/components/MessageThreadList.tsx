"use client"
import { useSuspenseQuery } from "@apollo/client"
import { Box, Text, Stack } from "@chakra-ui/react"
import Link from "next/link"
import type {
  ViewerMessageThreadsQuery,
  ViewerMessageThreadsQueryVariables,
} from "__generated__/apollo"
import { ViewerMessageThreadsDocument } from "__generated__/apollo"

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
    <Stack>
      {messageThreads.map((messageThread) => (
        <Link key={messageThread.id} href={`/messages/${messageThread.id}`}>
          <Box>
            <Text>{messageThread.latestMessage.text}</Text>
            <Text>{messageThread.latestMessage.user.name}</Text>
            <Text>{messageThread.latestMessage.isRead ? "既読" : "未読"}</Text>
          </Box>
        </Link>
      ))}
    </Stack>
  )
}
