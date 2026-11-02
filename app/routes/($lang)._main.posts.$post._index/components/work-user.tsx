import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext, useRef, useState } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { OfficialBadge } from "~/components/official-badge"
import { SupportButton } from "~/components/support-button"
import { FollowSuggestions } from "~/components/user/follow-suggestions"
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
  userIsOfficial?: boolean
  userIsModerator?: boolean
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

  /** 最初に押す前のフォロー状態（フォロワー数は読み直さずに、ここからの差で合わせる） */
  const initialIsFollowRef = useRef<boolean | null>(null)

  const [followersCountDelta, setFollowersCountDelta] = useState(0)

  const [isShowingSuggestions, setIsShowingSuggestions] = useState(false)

  const onFollowChange = (nextIsFollow: boolean) => {
    if (initialIsFollowRef.current === null) {
      initialIsFollowRef.current = isFollow
    }
    setFollowersCountDelta(
      Number(nextIsFollow) - Number(initialIsFollowRef.current),
    )
    setIsShowingSuggestions(nextIsFollow)
  }
  const canShowSupportButton =
    (!appContext.isLoading || hasViewerSession) &&
    (!appContext.isNotLoggedIn || hasViewerSession) &&
    appContext.userId !== props.userId &&
    balance !== null
  const biography = t(
    props.userBiography ?? "",
    props.userEnBiography && props.userEnBiography.length > 0
      ? props.userEnBiography.replace("\\'", "'")
      : (props.userBiography ?? ""),
  )

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4">
      <Link
        to={`/users/${props.userLogin}`}
        className="group flex items-center gap-3"
      >
        <UserAvatarWithFrame
          alt={props.userName}
          frame={props.avatarFrame}
          sizeClassName="size-14 shrink-0"
          src={props.userIconImageURL}
        />
        <div className="min-w-0">
          <h2 className="flex items-center gap-1 font-bold leading-tight group-hover:underline">
            <span className="truncate">{props.userName}</span>
            <OfficialBadge
              isOfficial={props.userIsOfficial}
              isModerator={props.userIsModerator}
            />
          </h2>
          <p className="mt-1 text-muted-foreground text-xs">
            <span className="font-bold text-foreground tabular-nums">
              {Math.max(0, props.userFollowersCount + followersCountDelta)}
            </span>{" "}
            {t("フォロワー", "Followers")}
            <span className="mx-1.5">·</span>
            <span className="font-bold text-foreground tabular-nums">
              {props.userWorksCount}
            </span>{" "}
            {t("投稿", "Posts")}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2 [&>*]:min-w-0 [&>*]:flex-1">
        <FollowButton
          targetUserId={props.userId}
          targetUserName={props.userName}
          isFollow={isFollow}
          isFollower={data?.user?.isFollower ?? false}
          onFollowChange={onFollowChange}
        />
        {canShowSupportButton && (
          <SupportButton
            targetUserId={props.userId}
            targetUserName={props.userName}
            targetUserIconUrl={props.userIconImageURL}
            freeCoinBalance={balance.freeCoinsBalance}
            premiumCoinBalance={balance.premiumCoinsBalance}
            variant="profile"
          />
        )}
      </div>
      {isShowingSuggestions && (
        <FollowSuggestions
          userId={props.userId}
          userName={props.userName}
          onClose={() => setIsShowingSuggestions(false)}
        />
      )}
      {biography.length > 0 && (
        <p className="line-clamp-3 whitespace-pre-wrap break-words text-muted-foreground text-sm leading-relaxed">
          {biography}
        </p>
      )}
    </section>
  )
}

const userQuery = graphql(
  `query User($id: ID!) {
    user(id: $id) {
      id
      isFollowee
      isFollower
    }
  }`,
)
