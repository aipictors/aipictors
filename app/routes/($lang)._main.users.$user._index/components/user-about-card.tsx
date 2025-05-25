import { type FragmentOf, graphql } from "gql.tada"
import { Card } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"
import { UserBiography } from "~/routes/($lang)._main.users.$user._index/components/user-biography"

type Props = {
  user: FragmentOf<typeof UserAboutCardFragment>
}

export function UserAboutCard(props: Props) {
  const t = useTranslation()

  return (
    <Card className="flex flex-col gap-y-4 p-4">
      {props.user.biography && (
        <p className="text-sm">
          <UserBiography
            text={t(
              props.user.biography,
              props.user.enBiography && props.user.enBiography.length > 0
                ? props.user.enBiography
                : props.user.biography,
            )}
          />
        </p>
      )}
    </Card>
  )
}

export const UserAboutCardFragment = graphql(
  `fragment UserAboutCard on UserNode @_unmask {
    id
    createdAt
    biography
    enBiography
    twitterAccountId
    instagramAccountId
    githubAccountId
    mailAddress
  }`,
)
