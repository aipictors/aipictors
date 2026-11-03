import { useQuery } from "@apollo/client/index"
import { Link } from "~/lib/app/locale-router"
import { graphql } from "gql.tada"
import { XIcon } from "lucide-react"
import { useContext } from "react"
import { FollowButton } from "~/components/button/follow-button"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type Props = {
  /**
   * フォローしたユーザ（この人をフォローしている人がよくフォローしている人を出す）。
   * 省略すると最近伸びているクリエイター
   */
  userId?: string
  userName?: string
  /** 見出し（省略すると userName から作る） */
  title?: string
  /** 何人出すか（最大 12） */
  limit?: number
  className?: string
  onClose?: () => void
}

/**
 * フォローした直後に出す「こちらもおすすめ」
 * 作品のサムネイルを 3 枚ずつ見せて、その場でフォローできるようにする
 */
export function FollowSuggestions(props: Props) {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const { data } = useQuery(suggestedFollowUsersQuery, {
    skip: authContext.isNotLoggedIn,
    variables: { userId: props.userId ?? null, limit: props.limit ?? 6 },
    fetchPolicy: "cache-first",
  })

  const users = data?.suggestedFollowUsers ?? []

  if (users.length === 0) {
    return null
  }

  return (
    <section
      className={cn(
        "fade-in-0 slide-in-from-top-2 animate-in space-y-2 rounded-xl border bg-card p-3 duration-300",
        props.className,
      )}
      aria-label={t("おすすめのクリエイター", "Suggested creators")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-sm">
          {props.title
            ? props.title
            : props.userName
              ? t(
                  `${props.userName}さんが好きな人はこちらもフォローしています`,
                  `People who follow ${props.userName} also follow`,
                )
              : t("こちらもおすすめ", "You might also like")}
        </p>
        {props.onClose && (
          <button
            type="button"
            onClick={props.onClose}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
            aria-label={t("閉じる", "Close")}
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
      <ul className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex w-36 shrink-0 snap-start flex-col gap-2 rounded-lg border bg-background p-2"
          >
            <Link
              to={`/users/${user.login}`}
              className="flex min-w-0 items-center gap-2"
            >
              <UserAvatarWithFrame
                alt={user.name}
                frame={null}
                sizeClassName="size-8"
                src={withIconUrlFallback(user.iconUrl)}
              />
              <span className="min-w-0 truncate font-bold text-xs">
                {user.name}
              </span>
            </Link>
            <Link
              to={`/users/${user.login}`}
              className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-md"
              tabIndex={-1}
            >
              {user.works.slice(0, 3).map((work) => (
                <img
                  key={work.id}
                  src={work.smallThumbnailImageURL}
                  alt={t(work.title, work.enTitle || undefined)}
                  loading="lazy"
                  className="aspect-square w-full bg-muted object-cover"
                />
              ))}
            </Link>
            <FollowButton
              targetUserId={user.id}
              targetUserName={user.name}
              isFollow={user.isFollowee}
              isFollower={user.isFollower}
              className="h-7 text-xs"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

const suggestedFollowUsersQuery = graphql(
  `query SuggestedFollowUsers($userId: ID, $limit: Int) {
    suggestedFollowUsers(userId: $userId, limit: $limit) {
      id
      login
      name
      iconUrl
      isFollowee
      isFollower
      works(offset: 0, limit: 3, where: { ratings: [G] }) {
        id
        title
        enTitle
        smallThumbnailImageURL
      }
    }
  }`,
)
