import { type FragmentOf, graphql } from "gql.tada"
import { Avatar, AvatarImage } from "~/components/ui/avatar"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  request: FragmentOf<typeof HomeRequestCardFragment>
}

export function HomeRequestCard(props: Props) {
  return (
    <Card>
      <CardContent className="overflow-hidden p-0">
        <img
          className="w-full"
          src={props.request.firstDeliverable?.file.squareThumbnailImageURL}
          alt={props.request.firstDeliverable?.id}
        />
        <div>
          <div className="flex gap-x-2 text-ellipsis p-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={props.request.recipient?.aipicsUser?.iconUrl ?? undefined}
              />
            </Avatar>
            <h2 className="font-bold">
              {props.request.recipient?.aipicsUser?.name}
            </h2>
          </div>
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
        iconUrl
      }
    }
  }`,
)
