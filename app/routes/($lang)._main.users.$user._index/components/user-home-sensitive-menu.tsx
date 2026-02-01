import { useQuery } from "@apollo/client/index"
import { useNavigate } from "@remix-run/react"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { RefreshCcwIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { PromptonRequestColorfulButton } from "~/routes/($lang)._main.posts.$post._index/components/prompton-request-colorful-button"
import { UserActionOther } from "~/routes/($lang)._main.users.$user._index/components/user-action-other"
import { UserActionShare } from "~/routes/($lang)._main.users.$user._index/components/user-action-share"

type Props = {
  user: FragmentOf<typeof UserHomeMenuSensitiveFragment>
}

export function UserHomeSensitiveMenu(props: Props) {
  const cachedUser = readFragment(UserHomeMenuSensitiveFragment, props.user)

  const { data = null } = useQuery(UserQuery, {
    variables: { userId: decodeURIComponent(cachedUser.id) },
  })

  const user = readFragment(UserHomeMenuSensitiveFragment, data?.user)

  const t = useTranslation()

  const isMuted = user?.isMuted ?? false

  const isBlocked = user?.isBlocked ?? false

  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
      {/* Mobile: compact top actions */}
      <div className="flex items-center justify-end gap-2 md:hidden">
        <Button
          onClick={() => {
            navigate(`/users/${cachedUser.login}`)
          }}
          size="icon"
          variant="secondary"
          aria-label={t("全年齢", "G")}
          title={t("全年齢", "G")}
        >
          <RefreshCcwIcon className="size-4" />
        </Button>
        <UserActionOther
          id={cachedUser.id}
          isMuted={isMuted}
          isBlocked={isBlocked}
        />
        <UserActionShare login={cachedUser.login} name={cachedUser.name} />
        {cachedUser.promptonUser?.id && (
          <PromptonRequestColorfulButton
            rounded="rounded-full"
            promptonId={cachedUser.promptonUser.id}
            variant="icon"
            targetUserId={cachedUser.id}
          />
        )}
      </div>

      {/* Desktop actions */}
      <div className="mt-4 hidden w-full items-center justify-end gap-3 md:flex md:gap-4">
        <Button
          onClick={() => {
            navigate(`/users/${cachedUser.login}`)
          }}
          variant={"secondary"}
        >
          <div className="flex cursor-pointer items-center">
            <RefreshCcwIcon className="mr-1 w-3" />
            <p className="text-sm">{t("全年齢", "G")}</p>
          </div>
        </Button>
        <UserActionOther
          id={cachedUser.id}
          isMuted={isMuted}
          isBlocked={isBlocked}
        />
        <UserActionShare login={cachedUser.login} name={cachedUser.name} />
        {typeof user?.promptonUser?.id === "string" && (
          <PromptonRequestColorfulButton
            rounded="rounded-md"
            promptonId={user.promptonUser.id}
            variant="icon"
            targetUserId={user.id}
          />
        )}
      </div>
    </div>
  )
}

export const UserHomeMenuSensitiveFragment = graphql(
  `fragment UserHomeMenuSensitiveFragment on UserNode {
    id
    login
    isFollowee
    isFollower
    isMuted
    isBlocked
    name
    followersCount
    receivedLikesCount
    receivedSensitiveLikesCount
    promptonUser {
      id
    }
  }`,
  [],
)

const UserQuery = graphql(
  `query User($userId: ID!) {
    user(id: $userId) {
      ...UserHomeMenuSensitiveFragment
    }
  }`,
  [UserHomeMenuSensitiveFragment],
)
