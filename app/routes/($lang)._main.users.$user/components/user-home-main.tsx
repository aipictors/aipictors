import { FollowButton } from "~/components/button/follow-button"
import { Button } from "~/components/ui/button"
import { PromptonRequestColorfulButton } from "~/routes/($lang)._main.posts.$post/components/prompton-request-colorful-button"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { ProfileEditDialog } from "~/routes/($lang)._main.users.$user/components/profile-edit-dialog"
import { UserActionShare } from "~/routes/($lang)._main.users.$user/components/user-action-share"
import { UserActionOther } from "~/routes/($lang)._main.users.$user/components/user-action-other"

type Props = {
  user: FragmentOf<typeof userHomeMainFragment>
  userId: string
}

export function UserHomeMain(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: userInfo } = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: decodeURIComponent(props.userId),
    },
  })

  const isFollow = userInfo?.user?.isFollowee ?? false

  const isMute = userInfo?.user?.isMuted ?? false

  return (
    <div className="relative m-auto h-72 w-full md:h-24">
      <div className="absolute top-2 right-0 hidden md:block">
        <div className="flex w-full items-center justify-end space-x-4">
          <UserActionOther id={props.user.id} isMuted={isMute} />
          <UserActionShare login={props.user.login} name={props.user.name} />
          <FollowButton
            targetUserId={props.user.id}
            isFollow={isFollow}
            triggerChildren={
              <Button className="font-bold">フォローする</Button>
            }
            unFollowTriggerChildren={
              <Button variant={"secondary"}>フォロー中</Button>
            }
          />
          {props.user.promptonUser !== null &&
            props.user.promptonUser.id !== null && (
              <PromptonRequestColorfulButton
                rounded="rounded-md"
                promptonId={props.user.promptonUser.id}
                targetUserId={props.user.id}
              />
            )}
          {authContext.userId === props.user.id && (
            <ProfileEditDialog triggerChildren={<Button>編集</Button>} />
          )}
        </div>
      </div>

      <div className="absolute top-48 left-0 block w-[100%] px-8 md:hidden">
        {authContext.userId !== props.user.id && (
          <FollowButton
            className="mb-2 w-[100%] rounded-full"
            targetUserId={"2"}
            isFollow={isFollow}
          />
        )}
        {props.user.promptonUser !== null &&
          props.user.promptonUser.id !== null && (
            <div className={"block w-[100%] rounded-full"}>
              <PromptonRequestColorfulButton
                rounded="rounded-full"
                promptonId={props.user.promptonUser.id}
                hideIcon={true}
                targetUserId={props.user.id}
              />
            </div>
          )}
        {authContext.userId === props.user.id && (
          <ProfileEditDialog
            triggerChildren={
              <Button className="w-full rounded-full">プロフィール編集</Button>
            }
          />
        )}
      </div>
    </div>
  )
}

export const userHomeMainFragment = graphql(
  `fragment UserHomeMain on UserNode @_unmask {
    id
    login
    isFollowee
    isFollower
    isMuted
    name
    promptonUser {
      id
    }
  }`,
  [],
)

const userQuery = graphql(
  `query User(
    $userId: ID!,
  ) {
    user(id: $userId) {
      ...UserHomeMain
    }
  }`,
  [userHomeMainFragment],
)
