import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { SupportButton } from "~/components/support-button"
import { AuthContext } from "~/contexts/auth-context"
import { useCoinBalance } from "~/hooks/use-coin-balance"
import { useTranslation } from "~/hooks/use-translation"
import { hasViewerRequestSession } from "~/lib/viewer-request-headers"
import { UserBiography } from "~/routes/($lang)._main.users.$user._index/components/user-biography"

type Props = {
  user: FragmentOf<typeof UserAboutCardFragment>
}

export function UserAboutCard(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const { balance } = useCoinBalance()
  const hasViewerSession = hasViewerRequestSession()

  const startedAtText = new Date(
    props.user.createdAt * 1000,
  ).toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
  })

  const biographyText = t(
    props.user.biography ?? "",
    props.user.enBiography && props.user.enBiography.length > 0
      ? props.user.enBiography
      : (props.user.biography ?? ""),
  ).trim()

  const isBiographyEmpty = biographyText.length === 0
  const isBiographyShort = biographyText.length > 0 && biographyText.length < 24

  const canShowSupportButton =
    (!authContext.isLoading || hasViewerSession) &&
    (!authContext.isNotLoggedIn || hasViewerSession) &&
    authContext.userId !== props.user.id

  return (
    <section className="hidden space-y-3 md:block">
      <div className="text-muted-foreground text-xs">
        <span>
          {startedAtText} {t("開始", "Started")}
        </span>
        <span className="mx-2">•</span>
        <span>
          {t("ID", "ID")}: <span className="font-mono">{props.user.id}</span>
        </span>
      </div>

      <div className="space-y-2">
        {!isBiographyEmpty && (
          <p className="text-sm leading-relaxed">
            <UserBiography text={biographyText} />
          </p>
        )}
      </div>

      {canShowSupportButton && (
        <div className="pt-2">
          <SupportButton
            targetUserId={props.user.id}
            targetUserName={props.user.name}
            targetUserIconUrl={props.user.iconUrl}
            freeCoinBalance={balance?.freeCoinsBalance ?? 0}
            premiumCoinBalance={balance?.premiumCoinsBalance ?? 0}
          />
        </div>
      )}
    </section>
  )
}

export const UserAboutCardFragment = graphql(
  `fragment UserAboutCard on UserNode @_unmask {
    id
    name
    iconUrl
    createdAt
    biography
    enBiography
    twitterAccountId
    instagramAccountId
    githubAccountId
    mailAddress
  }`,
)
