import { type FragmentOf, graphql } from "gql.tada"
import { SnsIconLink } from "~/components/sns-icon"
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
      <p className="flex items-center space-x-2 text-sm opacity-80">
        {new Date(1672953307 * 1000).toLocaleDateString("ja-JP", {
          timeZone: "Asia/Tokyo",
          year: "numeric",
          month: "2-digit",
        })}
        {t("頃開始", "Started around")}
      </p>
      {props.user.biography && (
        <p className="text-sm">
          <UserBiography
            text={t(
              props.user.biography,
              props.user.enBiography && props.user.enBiography.length > 0
                ? props.user.enBiography
                : (props.user.biography ?? ""),
            )}
          />
        </p>
      )}
      <div className="flex items-center gap-x-4">
        {props.user.twitterAccountId && (
          <SnsIconLink
            url={`https://twitter.com/${props.user.twitterAccountId}`}
          />
        )}
        {props.user.instagramAccountId && (
          <SnsIconLink
            url={`https://www.instagram.com/${props.user.instagramAccountId}`}
          />
        )}
        {props.user.githubAccountId && (
          <SnsIconLink
            url={`https://www.github.com/${props.user.githubAccountId}`}
          />
        )}
        {props.user.mailAddress && (
          <SnsIconLink url={`mailto:${props.user.mailAddress}`} />
        )}
      </div>
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
