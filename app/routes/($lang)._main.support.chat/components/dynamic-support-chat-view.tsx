import { MessageInput } from "~/routes/($lang)._main.support.chat/components/message-input"
import {
  MessageListItemFragment,
  SupportMessageList,
} from "~/routes/($lang)._main.support.chat/components/support-message-list"
import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { startTransition, useContext } from "react"
import { toast } from "sonner"
import { useInterval } from "usehooks-ts"
import { AuthContext } from "~/contexts/auth-context"

export function SupportChatView() {
  const authContext = useContext(AuthContext)

  const { data: supportMessages, refetch } = useQuery(MessagesQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      limit: 124,
      offset: 0,
    },
  })

  const [createMessage, { loading: isLoading }] = useMutation(
    createMessageMutation,
  )

  useInterval(() => {
    startTransition(() => {
      refetch()
    })
  }, 4000)

  const onSubmit = async (message: string) => {
    try {
      await createMessage({
        variables: { input: { text: message, recipientId: "1" } },
      })
      startTransition(() => {
        refetch()
      })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const adminAvatarURL =
    "https://files.aipictors.com/1d0f3f99-fe3a-4331-9c2f-8cce9d04bdf6"

  const messages = supportMessages?.viewer?.supportMessages ?? []

  return (
    <div className="sticky top-0 flex h-main flex-col">
      <SupportMessageList
        messages={messages}
        recipientIconImageURL={adminAvatarURL}
      />
      <MessageInput onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  )
}

const MessagesQuery = graphql(
  `query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      id
      supportMessages(offset: $offset, limit: $limit) {
        id
        ...MessageListItem
      }
    }
  }`,
  [MessageListItemFragment],
)

const createMessageMutation = graphql(
  `mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      ...MessageListItem
    }
  }`,
  [MessageListItemFragment],
)
