import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { CheckIcon, PenLine } from "lucide-react"
import { useContext, useState } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { OfficialBadge } from "~/components/official-badge"
import { OmissionNumber } from "~/components/omission-number"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { SnsIconLink } from "~/components/sns-icon"
import { SupportButton } from "~/components/support-button"
import { Button } from "~/components/ui/button"
import { FollowSuggestions } from "~/components/user/follow-suggestions"
import { AuthContext } from "~/contexts/auth-context"
import { useCoinBalance } from "~/hooks/use-coin-balance"
import { useTranslation } from "~/hooks/use-translation"
import { hasViewerRequestSession } from "~/lib/viewer-request-headers"
import { ProfileEditDialog } from "~/routes/($lang)._main.users.$user._index/components/profile-edit-dialog"
import { UserActionOther } from "~/routes/($lang)._main.users.$user._index/components/user-action-other"
import { UserActionShare } from "~/routes/($lang)._main.users.$user._index/components/user-action-share"
import { UserBiography } from "~/routes/($lang)._main.users.$user._index/components/user-biography"
import { UserProfileAvatar } from "~/routes/($lang)._main.users.$user._index/components/user-profile-avatar"
import { UserSubscriptionIcon } from "~/routes/($lang)._main.users.$user._index/components/user-subscription-icon"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  r18WorksCount?: number
}

/**
 * プロフィール（アイコン・名前・操作・数字・自己紹介）
 * スマホとパソコンで同じ要素を 1 つずつだけ出して、並びだけ変える
 * （以前は両方の分を出して片方を隠していたので、見出し h1 も 2 つあった）
 */
export function UserProfileNameIcon(props: Props) {
  const user = readFragment(UserProfileIconFragment, props.user)
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const { balance } = useCoinBalance()
  const hasViewerSession = hasViewerRequestSession()

  const r18WorksCount = props.r18WorksCount ?? 0
  const isMyPage = authContext.userId === user.id
  const canShowSupportButton =
    !isMyPage &&
    (!authContext.isLoading || hasViewerSession) &&
    (!authContext.isNotLoggedIn || hasViewerSession)

  const biographyText = t(
    user.biography ?? "",
    user.enBiography && user.enBiography.length > 0
      ? user.enBiography
      : (user.biography ?? ""),
  ).trim()

  const externalLinks = [
    user.twitterAccountId
      ? {
          key: "twitter",
          url: `https://x.com/${user.twitterAccountId}`,
          label: "X",
        }
      : null,
    user.instagramAccountId
      ? {
          key: "instagram",
          url: `https://www.instagram.com/${user.instagramAccountId}`,
          label: "Instagram",
        }
      : null,
    user.githubAccountId
      ? {
          key: "github",
          url: `https://github.com/${user.githubAccountId}`,
          label: "GitHub",
        }
      : null,
    user.mailAddress
      ? {
          key: "mail",
          url: `mailto:${user.mailAddress}`,
          label: t("メール", "Mail"),
        }
      : null,
  ].filter(
    (link): link is { key: string; url: string; label: string } =>
      link !== null,
  )

  /** 押したあとのフォロー状態（フォロワー数は読み直さずに差で合わせる） */
  const [viewerIsFollow, setViewerIsFollow] = useState<boolean | null>(null)

  const [isShowingSuggestions, setIsShowingSuggestions] = useState(false)

  const followersCountDelta =
    viewerIsFollow === null
      ? 0
      : Number(viewerIsFollow) - Number(Boolean(user.isFollowee))

  const onFollowChange = (nextIsFollow: boolean) => {
    setViewerIsFollow(nextIsFollow)
    setIsShowingSuggestions(nextIsFollow)
  }

  const stats = [
    {
      label: t("フォロワー", "Followers"),
      value: Math.max(0, user.followersCount + followersCountDelta),
    },
    { label: t("いいね", "Likes"), value: user.receivedLikesCount },
    { label: t("閲覧", "Views"), value: user.receivedViewsCount },
    { label: t("入賞", "Awards"), value: user.awardsCount },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 items-end gap-4">
          <div className="-mt-12 md:-mt-16 shrink-0 rounded-full bg-background p-1">
            <UserProfileAvatar
              alt={user.name}
              frame={user.avatarFrame}
              src={withIconUrlFallback(user.iconUrl)}
              size="auto"
            />
          </div>
          <div className="min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="break-words font-bold text-xl leading-tight md:text-2xl">
                {user.name.length > 0 ? user.name : t("名無し", "No name")}
              </h1>
              <OfficialBadge
                isOfficial={user.isOfficial}
                isModerator={user.isModerator}
                className="size-5"
              />
              <UserSubscriptionIcon passType={user.pass?.type} />
            </div>
            <p className="flex flex-wrap items-center gap-x-2 break-all text-muted-foreground text-sm">
              <span>@{user.login}</span>
              {!isMyPage && user.isFollower && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {t("フォローされています", "Follows you")}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
          {isMyPage ? (
            <ProfileEditDialog
              triggerChildren={
                <Button
                  variant="secondary"
                  className="flex-1 gap-1.5 rounded-full md:flex-none"
                >
                  <PenLine className="size-4" />
                  {t("プロフィールを編集", "Edit profile")}
                </Button>
              }
            />
          ) : (
            <FollowButton
              targetUserId={user.id}
              targetUserName={user.name}
              isFollow={Boolean(user.isFollowee)}
              isFollower={Boolean(user.isFollower)}
              onFollowChange={onFollowChange}
              triggerChildren={
                <Button className="flex-1 rounded-full px-6 font-bold active:scale-95 md:flex-none">
                  {user.isFollower
                    ? t("フォローバック", "Follow back")
                    : t("フォロー", "Follow")}
                </Button>
              }
              unFollowTriggerChildren={
                <Button
                  variant="secondary"
                  className="group flex-1 gap-1 rounded-full px-6 hover:bg-destructive/10 hover:text-destructive active:scale-95 md:flex-none"
                >
                  <CheckIcon className="size-4 group-hover:hidden" />
                  <span className="group-hover:hidden">
                    {t("フォロー中", "Following")}
                  </span>
                  <span className="hidden group-hover:inline">
                    {t("フォロー解除", "Unfollow")}
                  </span>
                </Button>
              }
            />
          )}
          {canShowSupportButton && (
            <SupportButton
              targetUserId={user.id}
              targetUserName={user.name}
              targetUserIconUrl={user.iconUrl}
              freeCoinBalance={balance?.freeCoinsBalance ?? 0}
              premiumCoinBalance={balance?.premiumCoinsBalance ?? 0}
              triggerClassName="rounded-full font-bold"
            />
          )}
          <UserActionShare login={user.login} name={user.name} />
          <UserActionOther
            id={user.id}
            isMuted={Boolean(user.isMuted)}
            isBlocked={Boolean(user.isBlocked)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <dl className="flex flex-wrap gap-x-6 gap-y-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-row-reverse items-baseline justify-end gap-1.5"
            >
              <dt className="text-muted-foreground text-xs">{stat.label}</dt>
              <dd className="font-bold text-base tabular-nums">
                <OmissionNumber number={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
        {r18WorksCount > 0 && (
          <SensitiveToggle
            variant="compact"
            label={`R18（${r18WorksCount >= 100 ? "99+" : r18WorksCount}）`}
            className="h-6 border-red-200/40 bg-background/30 px-2 text-red-700 text-xs shadow-none dark:border-red-700/40"
            showStatus={false}
          />
        )}
      </div>

      {isShowingSuggestions && (
        <FollowSuggestions
          userId={user.id}
          userName={user.name}
          onClose={() => setIsShowingSuggestions(false)}
        />
      )}

      {(biographyText.length > 0 || externalLinks.length > 0) && (
        <div className="space-y-2">
          {biographyText.length > 0 && (
            <p className="max-w-3xl whitespace-pre-wrap break-words text-sm leading-relaxed">
              <UserBiography text={biographyText} />
            </p>
          )}
          {externalLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
              {externalLinks.map((link) => (
                <SnsIconLink
                  key={link.key}
                  url={link.url}
                  variant="compact"
                  ariaLabel={link.label}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const UserProfileIconFragment = graphql(
  `fragment UserProfileIconFragment on UserNode {
    id
    name
    isModerator
    isOfficial
    login
    isFollowee
    isFollower
    isMuted
    isBlocked
    biography
    enBiography
    receivedLikesCount
    receivedSensitiveLikesCount
    followersCount
    awardsCount
    receivedViewsCount
    iconUrl
    avatarFrame {
      id
      frameType
      backgroundStyle
      overlayImageUrl
      borderPadding
    }
    twitterAccountId
    instagramAccountId
    githubAccountId
    mailAddress
    pass {
      id
      type
    }
  }`,
)
