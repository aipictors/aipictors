"use client"

import { toDateTimeText } from "@/app/_utils/to-date-time-text"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { viewerMessageThreadsQuery } from "@/graphql/queries/viewer/viewer-message-threads"
import { useSuspenseQuery } from "@apollo/client"
import Link from "next/link"
import { startTransition } from "react"
import { useInterval } from "usehooks-ts"

export const MessageThreadList = () => {
  const { data: threads, refetch } = useSuspenseQuery(
    viewerMessageThreadsQuery,
    {
      variables: {
        limit: 124,
        offset: 0,
      },
    },
  )

  useInterval(() => {
    startTransition(() => {
      refetch()
    })
  }, 4000)

  const messageThreads = threads.viewer?.messageThreads ?? []

  return (
    <aside className="sticky h-main min-w-80 w-80 pl-4 pb-4">
      <ScrollArea className="h-full">
        <div className="space-y-2 w-full">
          {messageThreads.map((messageThread) => (
            <Link
              key={messageThread.id}
              className="block"
              href={`/messages/${messageThread.id}`}
            >
              <Button
                className="h-auto p-4 flex flex-col overflow-hidden gap-y-2"
                variant={"secondary"}
              >
                <div className="w-full flex items-center gap-x-4">
                  <Avatar>
                    <AvatarImage
                      src={messageThread.recipient.iconImage?.downloadURL}
                    />
                    <AvatarFallback />
                  </Avatar>
                  <span className="whitespace-pre-wrap break-words">
                    {messageThread.recipient.name}
                  </span>
                </div>
                <div className="w-full flex flex-col items-start gap-y-2">
                  <p className="overflow-ellipsis overflow-hidden whitespace-pre-wrap break-words text-left">
                    {messageThread.latestMessage.text}
                  </p>
                  <p>{toDateTimeText(messageThread.latestMessage.createdAt)}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
