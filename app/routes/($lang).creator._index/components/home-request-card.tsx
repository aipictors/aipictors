import { Link } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { Avatar, AvatarImage } from "~/components/ui/avatar"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  request: FragmentOf<typeof HomeRequestCardFragment>
}

/**
 * 支援リクエスト
 */
export function HomeRequestCard (props: Props) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Link to={`/creator/requests/${props.request.id}`}>
          <img
            className="w-full"
            src={props.request.firstDeliverable?.file?.squareThumbnailImageURL}
            alt={props.request.firstDeliverable?.id}
          />
        </Link>
        <div className="flex items-center gap-x-2 p-2">
          {/* <Link to={`/users/${props.request.recipient.aipicsUser?.login}`}> */}
          <Avatar className="size-6">
            <AvatarImage
              src={props.request.recipient?.aipicsUser?.iconUrl ?? undefined}
            />
          </Avatar>
          <h2 className="overflow-hidden text-ellipsis text-nowrap font-bold text-sm">
            {props.request.recipient?.aipicsUser?.name}
          </h2>
        </div>
      </CardContent>
    </Card>
  )
}

export const HomeRequestCardFragment = graphql(
  `fragment HomeRequestCard on PromptonRequestNode @_unmask {
    id
    createdAt
    firstDeliverable {
      id
      file {
        id
        squareThumbnailImageURL
      }
    }
    recipient {
      id
      aipicsUser {
        id
        name
        login
        iconUrl
      }
    }
  }`,
)
