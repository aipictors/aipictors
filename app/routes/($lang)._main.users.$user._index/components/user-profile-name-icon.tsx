import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { PenLine } from "lucide-react"
import { useContext } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { OmissionNumber } from "~/components/omission-number"
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
import { SnsIconLink } from "~/components/sns-icon"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { PromptonRequestColorfulButton } from "~/routes/($lang)._main.posts.$post._index/components/prompton-request-colorful-button"
import { ProfileEditDialog } from "~/routes/($lang)._main.users.$user._index/components/profile-edit-dialog"
import { UserActionOther } from "~/routes/($lang)._main.users.$user._index/components/user-action-other"
import { UserActionShare } from "~/routes/($lang)._main.users.$user._index/components/user-action-share"
import { UserBiography } from "~/routes/($lang)._main.users.$user._index/components/user-biography"
import { UserModeratorIcon } from "~/routes/($lang)._main.users.$user._index/components/user-moderator-icon"
import { UserProfileAvatar } from "~/routes/($lang)._main.users.$user._index/components/user-profile-avatar"
import { UserSubscriptionIcon } from "~/routes/($lang)._main.users.$user._index/components/user-subscription-icon"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  r18WorksCount?: number
}

/**
 * ヘッダーのアイコンと名前の部分
 */
export function UserProfileNameIcon(props: Props) {
  const user = readFragment(UserProfileIconFragment, props.user)

  const r18WorksCount = props.r18WorksCount ?? 0
  const r18WorksCountText = r18WorksCount >= 100 ? "99+" : String(r18WorksCount)
  const shouldShowR18Toggle = r18WorksCount > 0
  const r18Label = `R18（${r18WorksCountText}）`

  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const isMyPage = authContext.userId === user.id

  const isFollowee = Boolean(user.isFollowee)

  const isMuted = Boolean(user.isMuted)

  const isBlocked = Boolean(user.isBlocked)

  const promptonId = user.promptonUser?.id ?? null

  const biographyText = t(
    user.biography ?? "",
    user.enBiography && user.enBiography.length > 0
      ? user.enBiography
      : (user.biography ?? ""),
  ).trim()

  type ExternalLink = {
    key: "github" | "mail" | "twitter" | "instagram"
    url: string
    label: string
  }

  const isNotNull = <T,>(value: T | null): value is T => value !== null

  const externalLinks: ExternalLink[] = [
    user.githubAccountId
      ? {
          key: "github" as const,
          url: `https://www.github.com/${user.githubAccountId}`,
          label: t("GitHub", "GitHub"),
        }
      : null,
    user.mailAddress
      ? {
          key: "mail" as const,
          url: `mailto:${user.mailAddress}`,
          label: t("メール", "Mail"),
        }
      : null,
    user.twitterAccountId
      ? {
          key: "twitter" as const,
          url: `https://twitter.com/${user.twitterAccountId}`,
          label: t("X", "X"),
        }
      : null,
    user.instagramAccountId
      ? {
          key: "instagram" as const,
          url: `https://www.instagram.com/${user.instagramAccountId}`,
          label: t("Instagram", "Instagram"),
        }
      : null,
  ].filter(isNotNull)

  const hasExternalLinks = externalLinks.length > 0

  return (
    <div className="relative">
      <div className="-top-5 md:-top-10 absolute left-0">
        <UserProfileAvatar
          alt={user.name}
          src={withIconUrlFallback(user.iconUrl)}
          size={"auto"}
        />
      </div>

      <div className="min-w-0 pl-24 md:pl-40">
        {/* Mobile header (avoid truncation + reduce clutter) */}
        <div className="space-y-2 md:hidden">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words font-bold text-xl leading-tight">
                {user.name.length > 0 ? user.name : t("名無し", "None")}
              </h1>
              <UserSubscriptionIcon passType={user.pass?.type} />
              <UserModeratorIcon isModerator={user.isModerator} />
              {shouldShowR18Toggle && (
                <SensitiveToggle
                  variant="compact"
                  label={r18Label}
                  className="h-6 border-red-200/40 bg-background/30 px-2 text-red-500 text-xs shadow-none dark:border-red-700/40"
                  showStatus={false}
                />
              )}
            </div>
            <p className="break-all text-muted-foreground text-sm">
              @{user.login}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <UserActionShare login={user.login} name={user.name} />
            <UserActionOther
              id={user.id}
              isMuted={isMuted}
              isBlocked={isBlocked}
            />
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden items-start justify-between gap-3 md:flex">
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 items-center gap-2 md:flex-wrap md:gap-x-2 md:gap-y-1">
              <h1 className="truncate font-bold text-xl md:text-2xl">
                {user.name.length > 0 ? user.name : t("名無し", "None")}
              </h1>
              <UserSubscriptionIcon passType={user.pass?.type} />
              <UserModeratorIcon isModerator={user.isModerator} />
              {shouldShowR18Toggle && (
                <SensitiveToggle
                  variant="compact"
                  label={r18Label}
                  className="h-6 border-red-200/40 bg-background/30 px-2 text-red-500 text-xs shadow-none md:h-7 md:px-3 md:text-sm dark:border-red-700/40"
                  showStatus={false}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-muted-foreground text-sm">
                @
                {user.login.length > 16
                  ? `${user.login.slice(0, 16)}...`
                  : user.login}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isMyPage && (
              <ProfileEditDialog
                triggerChildren={
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full text-muted-foreground"
                    aria-label={t("プロフィールを編集", "Edit profile")}
                    title={t("プロフィールを編集", "Edit profile")}
                  >
                    <PenLine className="size-4" />
                  </Button>
                }
              />
            )}
            <UserActionShare login={user.login} name={user.name} />
            {!isMyPage && (
              <FollowButton
                targetUserId={user.id}
                isFollow={isFollowee}
                triggerChildren={
                  <Button className="font-bold">
                    {t("フォロー", "Follow")}
                  </Button>
                }
                unFollowTriggerChildren={
                  <Button variant={"secondary"}>
                    {t("フォロー中", "Following")}
                  </Button>
                }
              />
            )}
            <UserActionOther
              id={user.id}
              isMuted={isMuted}
              isBlocked={isBlocked}
            />
            {typeof promptonId === "string" && (
              <PromptonRequestColorfulButton
                promptonId={promptonId}
                targetUserId={user.id}
                variant="icon"
                rounded="rounded-full"
              />
            )}
          </div>
        </div>

        {/* Mobile: stats, then primary actions (full width), then biography + sns */}
        <div className="-ml-24 mt-3 w-[calc(100%+6rem)] space-y-3 md:hidden">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-lg">
                <OmissionNumber number={user.followersCount} />
              </span>
              <span className="text-[11px] text-muted-foreground">
                {t("フォロワー", "Followers")}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-lg">
                <OmissionNumber number={user.receivedViewsCount} />
              </span>
              <span className="text-[11px] text-muted-foreground">
                {t("閲覧", "Views")}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 text-foreground/80">
              <span className="font-semibold text-lg">
                <OmissionNumber number={user.receivedLikesCount} />
              </span>
              <span className="text-[11px] text-muted-foreground/80">
                {t("いいね", "Likes")}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 text-foreground/80">
              <span className="font-semibold text-lg">
                <OmissionNumber number={user.awardsCount} />
              </span>
              <span className="text-[11px] text-muted-foreground/80">
                {t("入賞", "Awards")}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {isMyPage && (
              <ProfileEditDialog
                triggerChildren={
                  <Button className="w-full font-bold" variant="secondary">
                    {t("プロフィールを編集", "Edit profile")}
                  </Button>
                }
              />
            )}
            {!isMyPage && (
              <FollowButton
                targetUserId={user.id}
                isFollow={isFollowee}
                triggerChildren={
                  <Button className="w-full rounded-full font-bold">
                    {t("フォロー", "Follow")}
                  </Button>
                }
                unFollowTriggerChildren={
                  <Button className="w-full rounded-full" variant={"secondary"}>
                    {t("フォロー中", "Following")}
                  </Button>
                }
              />
            )}
            {typeof promptonId === "string" && (
              <PromptonRequestColorfulButton
                promptonId={promptonId}
                targetUserId={user.id}
                rounded="rounded-full"
              />
            )}
          </div>

          {biographyText.length > 0 && (
            <p className="text-sm leading-relaxed">
              <UserBiography text={biographyText} />
            </p>
          )}

          {hasExternalLinks && (
            <div className="flex w-full flex-wrap items-center gap-2 pt-1 text-muted-foreground">
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

        {hasExternalLinks && (
          <div className="mt-2 hidden flex-wrap items-center gap-3 text-muted-foreground md:flex">
            <div className="flex items-center gap-3">
              {externalLinks.map((link) => (
                <SnsIconLink
                  key={link.key}
                  url={link.url}
                  ariaLabel={link.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats (supplemental) */}
        <div className="mt-4 hidden flex-wrap items-center gap-x-6 gap-y-2 md:flex">
          <div className="flex items-baseline gap-1.5 md:gap-2">
            <span className="font-semibold text-lg md:text-base">
              <OmissionNumber number={user.followersCount} />
            </span>
            <span className="text-[11px] text-muted-foreground md:text-xs">
              {t("フォロワー", "Followers")}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 text-foreground/80 md:gap-2">
            <span className="font-semibold text-lg md:text-base">
              <OmissionNumber number={user.receivedLikesCount} />
            </span>
            <span className="text-[11px] text-muted-foreground/80 md:text-xs">
              {t("いいね", "Likes")}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 md:gap-2">
            <span className="font-semibold text-lg md:text-base">
              <OmissionNumber number={user.receivedViewsCount} />
            </span>
            <span className="text-[11px] text-muted-foreground md:text-xs">
              {t("閲覧", "Views")}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 text-foreground/80 md:gap-2">
            <span className="font-semibold text-lg md:text-base">
              <OmissionNumber number={user.awardsCount} />
            </span>
            <span className="text-[11px] text-muted-foreground/80 md:text-xs">
              {t("入賞", "Awards")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const UserProfileIconFragment = graphql(
  `fragment UserProfileIconFragment on UserNode {
    id
    name
    isModerator
    login
    isFollowee
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
    twitterAccountId
    instagramAccountId
    githubAccountId
    mailAddress
    promptonUser {
      id
    }
    pass {
      id
      type
    }
  }`,
)
