import { useSuspenseQuery } from "@apollo/client/index"
import { ScrollArea } from "~/components/ui/scroll-area"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { MessageListItemFragment } from "~/routes/($lang)._main.support.chat/components/support-message-list"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar"
import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"

type Props = { onClick?: () => void }

/**
 * ヘッダーのメッセージ一覧内容
 */
export function HomeMessagesContents({ onClick }: Props) {
  const authContext = useContext(AuthContext)

  if (authContext.userId === null) {
    return null
  }

  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
  const { data: supportMessages, refetch } = useSuspenseQuery(MessagesQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      limit: 10,
      offset: 0,
    },
  })

  const messages = supportMessages?.viewer?.supportMessages ?? []

  // biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
  const t = useTranslation()

  if (messages.length === 0) {
    return (
      <>
        <div className="m-auto">
          <img
            alt="sorry-image"
            className="m-auto w-48 md:w-64"
            src="https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/pictor-chan-sorry-image.png"
          />
          <p className="text-center text-xl opacity-60">
            {t("通知はありません", "There are no notifications")}
          </p>
        </div>
      </>
    )
  }

  return (
    <ScrollArea className="h-64 overflow-y-auto md:h-96">
      <div className="flex max-w-96 flex-col space-y-1 overflow-hidden p-1">
        {messages.map((message) => (
          <Link
            to={"/support/chat"}
            key={message.id.toString()}
            className="flex items-center space-x-2"
            onClick={onClick}
          >
            <Avatar>
              <AvatarImage
                className="rounded-full"
                src={withIconUrlFallback(message.user.iconUrl)}
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
  [MessageListItemFragment],
)
