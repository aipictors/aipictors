import { toDateTimeText } from "~/utils/to-date-time-text"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  message: FragmentOf<typeof ThreadLastMessageFragment>
}

export function ThreadLastMessage(props: Props) {
  return (
    <div className="flex w-full flex-col items-start gap-y-2">
      <p className="overflow-hidden text-ellipsis whitespace-pre-wrap break-words text-left">
        {props.message.text}
      </p>
      <p>{toDateTimeText(props.message.createdAt)}</p>
    </div>
  )
}

export const ThreadLastMessageFragment = graphql(
  `fragment ThreadLastMessage on MessageNode @_unmask {
    id
    text
    createdAt
    user {
      id
    }
  }`,
)
