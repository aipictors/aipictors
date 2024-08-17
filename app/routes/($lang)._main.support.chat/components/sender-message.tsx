import { type FragmentOf, graphql } from "gql.tada"
import { Card } from "~/components/ui/card"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"

type Props = {
  message: FragmentOf<typeof SenderMessageFragment>
}

export function SenderMessage(props: Props) {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-sm flex-col gap-y-2">
        <Card
          className={
            "rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-xl px-6 py-2"
          }
        >
          <p className="overflow-hidden whitespace-pre-wrap break-words">
            {props.message.text}
          </p>
        </Card>
        <div className="flex justify-end space-x-2">
          <span className="text-xs">{props.message.isRead ? "既読" : ""}</span>
          <p className="text-xs">
            {toElapsedTimeText(props.message.createdAt)}
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
  }`,
)
