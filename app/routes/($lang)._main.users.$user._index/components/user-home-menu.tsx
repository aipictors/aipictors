import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { PromptonRequestColorfulButton } from "~/routes/($lang)._main.posts.$post._index/components/prompton-request-colorful-button"
import { UserActionOther } from "~/routes/($lang)._main.users.$user._index/components/user-action-other"

type Props = {
  user: FragmentOf<typeof UserHomeMenuFragment>
}

export function UserHomeMenu(props: Props) {
  const cachedUser = readFragment(UserHomeMenuFragment, props.user)

  const { data = null } = useQuery(UserQuery, {
    variables: { userId: decodeURIComponent(cachedUser.id) },
  })

  const user = readFragment(UserHomeMenuFragment, data?.user) ?? cachedUser

  const isMuted = Boolean(user.isMuted)

  const isBlocked = Boolean(user.isBlocked)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
      {/* Mobile: stacked primary actions */}
      <div className="mt-3 flex flex-col gap-2 md:hidden">
        {user.promptonUser !== null && user.promptonUser.id !== null && (
          <div className="flex justify-end">
            <PromptonRequestColorfulButton
              rounded="rounded-full"
              promptonId={user.promptonUser.id}
              variant="icon"
              targetUserId={user.id}
            />
          </div>
        )}
      </div>

      {/* Desktop actions */}
      <div className="mt-4 hidden w-full items-center justify-end gap-3 md:flex md:gap-4">
        <UserActionOther id={user.id} isMuted={isMuted} isBlocked={isBlocked} />
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

export const UserHomeMenuFragment = graphql(
  `fragment UserHomeMenuFragment on UserNode {
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
      ...UserHomeMenuFragment
    }
  }`,
  [UserHomeMenuFragment],
)
