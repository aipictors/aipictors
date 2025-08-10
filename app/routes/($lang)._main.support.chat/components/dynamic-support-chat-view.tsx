import { MessageInput } from "~/routes/($lang)._main.support.chat/components/message-input"
import {
  MessageListItemFragment,
  SupportMessageList,
} from "~/routes/($lang)._main.support.chat/components/support-message-list"
import { useMutation, useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { startTransition, useContext, useState } from "react"
import { toast } from "sonner"
import { useInterval } from "usehooks-ts"
import { AuthContext } from "~/contexts/auth-context"
import { TypingIndicator } from "~/routes/($lang)._main.support.chat/components/typing-indicator"

export function SupportChatView() {
  const authContext = useContext(AuthContext)
  const [isWaitingForAiResponse, setIsWaitingForAiResponse] = useState(false)

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

  const [createAiMessageResponse] = useMutation(createAiMessageResponseMutation)

  useInterval(() => {
    startTransition(() => {
      refetch()
    })
  }, 4000)

  const onSubmit = async (message: string) => {
    try {
      // ユーザーメッセージを送信
      const _messageResult = await createMessage({
        variables: { input: { text: message, recipientId: "1" } },
      })

      // メッセージ送信後にリストを更新
      startTransition(() => {
        refetch()
      })

      // AI返答待ち状態を開始
      setIsWaitingForAiResponse(true)

      try {
        // AI返答を取得
        await createAiMessageResponse()

        // AI返答後にメッセージリストを更新
        startTransition(() => {
          refetch()
        })
      } catch (aiError) {
        console.error("AI返答エラー:", aiError)
        if (aiError instanceof Error) {
          toast(`AI返答エラー: ${aiError.message}`)
        }
      } finally {
        setIsWaitingForAiResponse(false)
      }
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
      setIsWaitingForAiResponse(false)
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
      {isWaitingForAiResponse && <TypingIndicator />}
      <MessageInput
        onSubmit={onSubmit}
        isLoading={isLoading || isWaitingForAiResponse}
      />
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

const createAiMessageResponseMutation = graphql(
  `mutation CreateAiMessageResponse {
    createAiMessageResponse {
      id
      text
      ...MessageListItem
    }
  }`,
  [MessageListItemFragment],
)
