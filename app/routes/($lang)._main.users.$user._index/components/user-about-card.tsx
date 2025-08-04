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
        {new Date(props.user.createdAt * 1000).toLocaleDateString("ja-JP", {
          timeZone: "Asia/Tokyo",
          year: "numeric",
          month: "2-digit",
        })}
        {t("開始", "Started around")}
      </p>

      {/* ユーザIDを表示 */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">
          {t("ユーザーID", "User ID")}:
        </span>
        <code className="inline-flex items-center rounded-md border bg-muted px-2 py-1 font-mono text-muted-foreground text-xs">
          {props.user.id}
        </code>
      </div>

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
