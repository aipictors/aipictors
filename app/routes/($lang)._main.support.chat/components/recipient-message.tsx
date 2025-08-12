import { Avatar, AvatarImage } from "~/components/ui/avatar"
import { Card } from "~/components/ui/card"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"
import { AvatarFallback } from "@radix-ui/react-avatar"
import { type FragmentOf, graphql } from "gql.tada"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "@remix-run/react"

type Props = {
  message: FragmentOf<typeof RecipientMessageFragment>
  recipientIconImageURL: string
}

export function RecipientMessage(props: Props) {
  const t = useTranslation()

  const parseTextWithLinks = (text: string) => {
    const urlRegex =
      /(https?:\/\/[^\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF）】」』】》）)\]}]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Link
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            key={index.toString()}
            to={part}
          >
            {part}
          </Link>
        )
      }
      return part
    })
  }

  return (
    <div className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={props.recipientIconImageURL} alt="avatar" />
        <AvatarFallback />
      </Avatar>
      <div className="flex max-w-sm flex-col gap-y-2">
        <Card className="rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl border-gray-300 bg-gray-100 px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
          <p className="overflow-hidden whitespace-pre-wrap break-words text-sm leading-relaxed">
            {parseTextWithLinks(props.message.text ?? "")}
          </p>
        </Card>
        <div className="flex justify-start">
          <p className="text-muted-foreground text-xs">
            {t(
              toElapsedTimeText(props.message.createdAt),
              toElapsedTimeEnText(props.message.createdAt),
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export const RecipientMessageFragment = graphql(
  `fragment RecipientMessage on MessageNode @_unmask {
    id
    text
    createdAt
  }`,
)
