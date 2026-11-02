import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { CheckIcon, PenLine } from "lucide-react"
import { useContext, useState } from "react"
import { UserAchievementShowcase } from "~/components/achievements/user-achievement-showcase"
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
import { cn } from "~/lib/utils"
import { hasViewerRequestSession } from "~/lib/viewer-request-headers"
import { ProfileEditDialog } from "~/routes/($lang)._main.users.$user._index/components/profile-edit-dialog"
import { UserActionOther } from "~/routes/($lang)._main.users.$user._index/components/user-action-other"
import { UserActionShare } from "~/routes/($lang)._main.users.$user._index/components/user-action-share"
import { UserBiography } from "~/routes/($lang)._main.users.$user._index/components/user-biography"
import { UserProfileAvatar } from "~/routes/($lang)._main.users.$user._index/components/user-profile-avatar"
import { UserProfileStatus } from "~/routes/($lang)._main.users.$user._index/components/user-profile-status"
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
    { label: t("作品", "Works"), value: user.worksCount },
    {
      label: t("フォロワー", "Followers"),
      value: Math.max(0, user.followersCount + followersCountDelta),
    },
    { label: t("いいね", "Likes"), value: user.receivedLikesCount },
    { label: t("閲覧", "Views"), value: user.receivedViewsCount },
    { label: t("入賞", "Awards"), value: user.awardsCount },
  ]

  const startedAtText = new Date(user.createdAt * 1000).toLocaleDateString(
    "ja-JP",
    { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit" },
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-x-4 gap-y-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="-mt-14 md:-mt-20 relative w-fit rounded-full bg-background p-1 shadow-lg">
          <UserProfileAvatar
            alt={user.name}
            frame={user.avatarFrame}
            src={withIconUrlFallback(user.iconUrl)}
            size="auto"
          />
          <UserProfileStatus statusText={user.statusText} isOwn={isMyPage} />
        </div>
        <div className="order-2 min-w-0 md:order-3 md:col-span-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="break-words font-bold text-2xl leading-tight tracking-tight md:text-3xl">
              {user.name.length > 0 ? user.name : t("名無し", "No name")}
            </h1>
            <OfficialBadge
              isOfficial={user.isOfficial}
              isModerator={user.isModerator}
              className="size-5"
            />
            <UserSubscriptionIcon passType={user.pass?.type} />
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 break-all text-muted-foreground text-sm">
            <span>@{user.login}</span>
            {!isMyPage && user.isFollower && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {t("フォローされています", "Follows you")}
              </span>
            )}
          </p>
        </div>
        <div className="order-3 flex items-center gap-2 md:order-2 md:justify-end md:self-end">
          {isMyPage ? (
            <ProfileEditDialog
              triggerChildren={
                <Button
                  variant="secondary"
                  className="h-11 flex-1 gap-1.5 rounded-full font-bold md:flex-none md:px-6"
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
                <Button className="h-11 flex-1 rounded-full px-6 font-bold active:scale-95 md:flex-none">
                  {user.isFollower
                    ? t("フォローバック", "Follow back")
                    : t("フォロー", "Follow")}
                </Button>
              }
              unFollowTriggerChildren={
                <Button
                  variant="secondary"
                  className="group h-11 flex-1 gap-1 rounded-full px-6 font-bold hover:bg-destructive/10 hover:text-destructive active:scale-95 md:flex-none"
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
              variant="profile"
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

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="min-w-0 flex-1 space-y-3">
          {biographyText.length > 0 && (
            <UserProfileBiography text={biographyText} />
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-3 md:items-end">
          <dl className="grid grid-cols-5 rounded-2xl bg-muted/50 px-1 py-3 md:px-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex min-w-0 flex-col-reverse items-center gap-0.5 md:px-4"
              >
                <dt className="truncate text-[11px] text-muted-foreground md:text-xs">
                  {stat.label}
                </dt>
                <dd className="whitespace-nowrap font-bold text-sm tabular-nums md:text-lg">
                  <OmissionNumber number={stat.value} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 md:justify-end">
            <UserAchievementShowcase userId={user.id} isOwn={isMyPage} />
            {r18WorksCount > 0 && (
              <SensitiveToggle
                variant="compact"
                label={`R18（${r18WorksCount >= 100 ? "99+" : r18WorksCount}）`}
                className="h-6 border-red-200/40 bg-background/30 px-2 text-red-700 text-xs shadow-none dark:border-red-800/40 dark:text-red-300"
                showStatus={false}
              />
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              {externalLinks.map((link) => (
                <SnsIconLink
                  key={link.key}
                  url={link.url}
                  variant="compact"
                  ariaLabel={link.label}
                />
              ))}
            </div>
            <span className="text-muted-foreground text-xs">
              {startedAtText} {t("開始", "Started")}
            </span>
          </div>
        </div>
      </div>

      {isShowingSuggestions && (
        <FollowSuggestions
          userId={user.id}
          userName={user.name}
          onClose={() => setIsShowingSuggestions(false)}
        />
      )}
    </div>
  )
}

/** 自己紹介。長いものは畳んで、作品がすぐ見えるようにする */
function UserProfileBiography(props: { text: string }) {
  const t = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = props.text.split("\n").length > 4 || props.text.length > 160

  return (
    <div className="max-w-3xl">
      <p
        className={cn(
          "whitespace-pre-wrap break-words text-sm leading-relaxed",
          isLong && !isExpanded && "line-clamp-4",
        )}
      >
        <UserBiography text={props.text} />
      </p>
      {isLong && (
        <button
          type="button"
          className="mt-1 text-muted-foreground text-xs hover:text-foreground"
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded ? t("閉じる", "Show less") : t("もっと見る", "Show more")}
        </button>
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
    statusText
    createdAt
    worksCount
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
