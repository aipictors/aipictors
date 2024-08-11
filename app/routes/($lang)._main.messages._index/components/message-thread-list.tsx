import {} from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useSuspenseQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { startTransition } from "react"
import { useInterval } from "usehooks-ts"
import {
  ThreadLastMessage,
  ThreadLastMessageFragment,
} from "~/routes/($lang)._main.messages._index/components/thread-last-message"
import {
  ThreadRecipient,
  ThreadRecipientFragment,
} from "~/routes/($lang)._main.messages._index/components/thread-recipient"

export const MessageThreadList = () => {
  const { data: threads, refetch } = useSuspenseQuery(MyMessageThreadsQuery, {
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
    <aside className="sticky h-main w-80 min-w-80 pb-4 pl-4">
      <ScrollArea type="always" className="h-full">
        <div className="w-full space-y-2">
          {messageThreads.map((thread) => (
            <Link
              key={thread.id}
              className="block"
              to={`/messages/${thread.id}`}
            >
              <Button
                className="flex h-auto flex-col gap-y-2 overflow-hidden p-4"
                variant={"secondary"}
              >
                <ThreadRecipient recipient={thread.recipient} />
                <ThreadLastMessage message={thread.latestMessage} />
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}

const MyMessageThreadsQuery = graphql(
  `query ViewerMessageThreads($offset: Int!, $limit: Int!) {
    viewer {
      id
      messageThreads(offset: $offset, limit: $limit) {
        id
        recipient {
          ...ThreadRecipient
        }
        latestMessage {
          ...ThreadLastMessage
        }
      }
    }
  }`,
  [ThreadRecipientFragment, ThreadLastMessageFragment],
)
