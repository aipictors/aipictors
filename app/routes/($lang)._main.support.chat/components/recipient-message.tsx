import { Card } from "~/components/ui/card"
import { type FragmentOf, graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "@remix-run/react"

type Props = {
  message: FragmentOf<typeof RecipientMessageFragment>
  recipientIconImageURL: string
}

export function RecipientMessage(props: Props) {
  const t = useTranslation()

  const parseTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Link
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
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
      <div className="flex max-w-sm flex-col gap-y-2">
        <Card className="rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl px-6 py-2">
          <p className="overflow-hidden whitespace-pre-wrap break-words">
            {parseTextWithLinks(props.message.text ? props.message.text : "")}
          </p>
        </Card>
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
