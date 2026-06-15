import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { SupportButton } from "~/components/support-button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { AuthContext } from "~/contexts/auth-context"
import { useCoinBalance } from "~/hooks/use-coin-balance"
import { useTranslation } from "~/hooks/use-translation"
import { hasViewerRequestSession } from "~/lib/viewer-request-headers"
import type { UserAvatarFramePresentation } from "~/utils/user-avatar-frame"

type Props = {
  userId: string
  userLogin: string
  userName: string
  userIconImageURL?: string
  avatarFrame?: UserAvatarFramePresentation | null
  userFollowersCount: number
  userBiography: string | null
  userEnBiography: string | null
  userWorksCount: number
}

/**
 * 作品へ投稿しているユーザの投稿数、フォロワ数、フォローするボタン等の情報
 */
export function WorkUser(props: Props) {
  const appContext = useContext(AuthContext)
  const hasViewerSession = hasViewerRequestSession()

  const t = useTranslation()
  const { balance } = useCoinBalance()
  const { data = null } = useQuery(userQuery, {
    skip: appContext.isLoading || appContext.userId === null,
    variables: {
      id: props.userId,
    },
  })

  const isFollow = data?.user?.isFollowee ?? false
  const canShowSupportButton =
    (!appContext.isLoading || hasViewerSession) &&
    (!appContext.isNotLoggedIn || hasViewerSession) &&
    appContext.userId !== props.userId &&
    balance !== null
  return (
    <Card>
      <CardHeader>
        <CardTitle className="p-4">
          <Link
            to={`/users/${props.userLogin}`}
            className="flex flex-col items-center text-center"
          >
            <UserAvatarWithFrame
              alt={props.userName}
              frame={props.avatarFrame}
              sizeClassName="size-24"
              src={props.userIconImageURL}
            />
            <p className="mt-2 text-center font-bold text-md">
              {props.userName}
            </p>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex w-full flex-col space-y-4">
        <div className="m-auto mb-4 flex items-center space-x-4">
          <div className="flex items-center">
            <p className="font-bold text-sm">{`${props.userFollowersCount}`}</p>
            <p className="text-sm opacity-50">{t("フォロワー", "Followers")}</p>
          </div>
          <div className="flex items-center">
            <p className="font-bold text-sm">{`${props.userWorksCount}`}</p>
            <p className="text-sm opacity-50">{t("投稿", "Posts")}</p>
          </div>
        </div>
        <FollowButton targetUserId={props.userId} isFollow={isFollow} />
        {canShowSupportButton && (
          <SupportButton
            targetUserId={props.userId}
            targetUserName={props.userName}
            targetUserIconUrl={props.userIconImageURL}
            freeCoinBalance={balance.freeCoinsBalance}
            premiumCoinBalance={balance.premiumCoinsBalance}
          />
        )}
        <div>
          {t(
            props.userBiography ?? "",
            props.userEnBiography && props.userEnBiography.length > 0
              ? props.userEnBiography.replace("\\'", "'")
              : (props.userBiography ?? ""),
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const userQuery = graphql(
  `query User($id: ID!) {
    user(id: $id) {
      id
      isFollowee
    }
  }`,
)
