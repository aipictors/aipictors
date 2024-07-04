import { FollowButton } from "@/_components/button/follow-button"
import { Button } from "@/_components/ui/button"
import { userQuery } from "@/_graphql/queries/user/user"
import { PromptonRequestColorfulButton } from "@/routes/($lang)._main.works.$work/_components/prompton-request-colorful-button"
import type { ResultOf } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "@/_contexts/auth-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { ProfileEditDialog } from "@/_components/profile-edit-dialog"

type Props = {
  user: NonNullable<ResultOf<typeof userQuery>["user"]>
  userId: string
}

export const UserHomeMain = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: userInfo } = useSuspenseQuery(userQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      userId: decodeURIComponent(props.userId),
      worksWhere: {},
      followeesWorksWhere: {},
      followersWorksWhere: {},
      bookmarksOffset: 0,
      bookmarksLimit: 0,
      bookmarksWhere: {},
      worksOffset: 0,
      worksLimit: 0,
      followeesOffset: 0,
      followeesLimit: 0,
      followeesWorksOffset: 0,
      followeesWorksLimit: 0,
      followersOffset: 0,
      followersLimit: 0,
      followersWorksOffset: 0,
      followersWorksLimit: 0,
    },
  })

  const isFollow = userInfo?.user?.isFollowee ?? false

  return (
    <div className="relative m-auto h-64 w-full bg-neutral-500/5 md:h-24 ">
      <div className="absolute top-8 right-0 hidden md:block">
        <div className="flex items-center space-x-2">
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
            <ProfileEditDialog
              triggerChildren={
                <Button className="absolute top-4 right-4">
                  プロフィール編集
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div className="absolute top-40 left-0 block w-[100%] px-8 md:hidden">
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
