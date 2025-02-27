import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { type FragmentOf, graphql } from "gql.tada"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  recipient: FragmentOf<typeof ThreadRecipientFragment>
}

export function ThreadRecipient(props: Props) {
  return (
    <div className="flex w-full items-center gap-x-4">
      <Avatar>
        <AvatarImage src={withIconUrlFallback(props.recipient.iconUrl)} />
        <AvatarFallback />
      </Avatar>
      <span className="whitespace-pre-wrap break-words">
        {props.recipient.name}
      </span>
    </div>
  )
}

export const ThreadRecipientFragment = graphql(
  `fragment ThreadRecipient on UserNode @_unmask {
    id
    name
    iconUrl
  }`,
)
