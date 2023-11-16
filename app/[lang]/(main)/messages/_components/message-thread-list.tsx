"use client"

import type {
  ViewerMessageThreadsQuery,
  ViewerMessageThreadsQueryVariables,
} from "@/__generated__/apollo"
import { ViewerMessageThreadsDocument } from "@/__generated__/apollo"
import { toDateTimeText } from "@/app/_utils/to-date-time-text"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

import { useSuspenseQuery } from "@apollo/client"
import { useInterval } from "@chakra-ui/react"
import Link from "next/link"
import { startTransition } from "react"

export const MessageThreadList = () => {
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
    <aside className="sticky top-16 h-screen min-w-16 max-w-24 overflow-y-auto border-l border-r">
      <div
      // style={<Separator />}
      >
        {messageThreads.map((messageThread) => (
          <Link href={`/messages/${messageThread.id}`}>
            <Button key={messageThread.id} variant={"ghost"}>
              <div className="flex flex-col overflow-hidden">
                <div className="flex">
                  <Avatar>
                    <AvatarImage
                      src={messageThread.recipient.iconImage?.downloadURL}
                    />
                  </Avatar>
                  <p>{messageThread.recipient.name}</p>
                </div>
                <div className="flex flex-col">
                  <p className="overflow-ellipsis overflow-hidden">
                    {messageThread.latestMessage.text}
                  </p>
                  <p>{toDateTimeText(messageThread.latestMessage.createdAt)}</p>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </aside>
  )
}
