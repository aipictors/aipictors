import { useQuery } from "@apollo/client/index"
import {} from "~/routes/($lang)._main._index/components/home-notifications-content-liked-item"
import { ScrollArea } from "~/components/ui/scroll-area"
import {} from "~/routes/($lang)._main._index/components/home-notifications-content-award-item"
import {} from "~/routes/($lang)._main._index/components/home-notifications-content-followed-item"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import {
  MessageListItemFragment,
  MessageThreadRecipientFragment,
} from "~/routes/($lang)._main.support.chat/components/support-message-list"
import { ExchangeIconUrl } from "~/utils/exchange-icon-url"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Link } from "@remix-run/react"

/**
 * ヘッダーのメッセージ一覧内容
 */
export function HomeMessagesContents() {
  const authContext = useContext(AuthContext)

  if (authContext.userId === null) {
    return null
  }

  const { data: supportMessages, refetch } = useQuery(MessagesQuery, {
    variables: {
      limit: 8,
      offset: 0,
    },
  })

  console.log(supportMessages)

  const messages = supportMessages?.viewer?.supportMessages ?? []

  if (messages.length === 0) {
    return (
      <>
        <div className="m-auto">
          <img
            alt="sorry-image"
            className="m-auto w-48 md:w-64"
            src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/pictor-chan-sorry-image.png"
          />
          <p className="text-center text-xl opacity-60">{"通知はありません"}</p>
        </div>
      </>
    )
  }

  return (
    <ScrollArea className="h-96 overflow-y-auto">
      <div className="max-w-96 overflow-hidden">
        {messages.map((message) => (
          <Link
            to={"/support/chat"}
            key={message.id.toString()}
            className="flex items-center space-x-2"
          >
            <Avatar>
              <AvatarImage
                className="rounded-full"
                src={ExchangeIconUrl(message.user.iconUrl)}
                alt=""
              />
              <AvatarFallback />
            </Avatar>
            <p>{message.text}</p>
          </Link>
        ))}
      </div>
    </ScrollArea>
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
  [MessageThreadRecipientFragment, MessageListItemFragment],
)
