import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { Card } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"
import { toElapsedTimeEnText } from "~/utils/to-elapsed-time-en-text"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"

type Props = {
  message: FragmentOf<typeof SenderMessageFragment>
}

export function SenderMessage (props: Props) {
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
            className="text-blue-100 underline hover:text-white"
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
    <div className="flex justify-end">
      <div className="flex max-w-[90%] flex-col gap-y-2 md:max-w-[80%]">
        <Card
          className={
            "rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-xl border-blue-500 bg-blue-500 px-4 py-3 text-white"
          }
        >
          <p className="overflow-hidden whitespace-pre-wrap break-words text-sm leading-relaxed">
            {parseTextWithLinks(props.message.text ?? "")}
          </p>
        </Card>
        <div className="flex justify-end space-x-2">
          <span className="text-muted-foreground text-xs">
            {props.message.isRead ? t("既読", "Read") : ""}
          </span>
          <p className="text-xs">
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

export const SenderMessageFragment = graphql(
  `fragment SenderMessage on MessageNode @_unmask {
    id
    text
    isRead
    createdAt
    user {
      iconUrl
      name
    }
  }`,
)
