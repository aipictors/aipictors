import { ScrollArea } from "~/components/ui/scroll-area"
import { messageFieldsFragment } from "~/graphql/fragments/message-fields"
import { SupportMessageList } from "~/routes/($lang)._main.support.chat/components/support-message-list"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import { GenerationMessageInput } from "~/routes/($lang).generation._index/components/task-view/generation-message-input"
import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { startTransition } from "react"
import { toast } from "sonner"
import { useInterval } from "usehooks-ts"

/**
 * 連絡画面
 */
export function GenerationCommunicationView() {
  const { data: supportMessages, refetch } = useQuery(
    viewerSupportMessagesQuery,
    {
      variables: {
        limit: 124,
        offset: 0,
      },
    },
  )

  const [createMessage, { loading: isLoading }] = useMutation(
    createMessageMutation,
  )

  useInterval(() => {
    startTransition(() => {
      refetch()
    })
  }, 10000)

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
    "https://www.aipictors.com/wp-content/uploads/2023/04/aTyRPjXLGxJB9EKrqSM43CYfWFQ8is.webp"

  const messages = supportMessages?.viewer?.supportMessages ?? []

  return (
    <GenerationViewCard>
      <ScrollArea
        type="always"
        className="relative flex flex-col overflow-y-auto p-4"
      >
        <SupportMessageList
          messages={messages}
          recipientIconImageURL={adminAvatarURL}
        />
      </ScrollArea>
      <GenerationMessageInput onSubmit={onSubmit} isLoading={isLoading} />
    </GenerationViewCard>
  )
}

const viewerSupportMessagesQuery = graphql(
  `query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      id
      supportMessages(offset: $offset, limit: $limit) {
        ...MessageFields
      }
    }
  }`,
  [messageFieldsFragment],
)

const createMessageMutation = graphql(
  `mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      ...MessageFields
    }
  }`,
  [messageFieldsFragment],
)
