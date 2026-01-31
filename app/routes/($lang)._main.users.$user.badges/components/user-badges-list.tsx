import { type FragmentOf, graphql } from "gql.tada"
import { Card, CardHeader, CardContent, CardTitle } from "~/components/ui/card"

type Props = {
  badges: FragmentOf<typeof UserBadgeListItemFragment>[]
}

export function UserBadgesList (props: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      {props.badges.map((badge) => (
        <Card key={badge.id} className="w-40">
          <CardHeader>
            <img
              src={badge.imageUrl || ""}
              alt={badge.text}
              className="m-auto w-24"
            />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-center text-sm md:text-base">
              {badge.text}
            </CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export const UserBadgeListItemFragment = graphql(`
  fragment UserBadgeListItem on BadgeNode @_unmask {
    id
    imageUrl
    text
  }
`)
