import { FollowButton } from "~/components/button/follow-button"
import { Button } from "~/components/ui/button"
import { PromptonRequestColorfulButton } from "~/routes/($lang)._main.posts.$post._index/components/prompton-request-colorful-button"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { ProfileEditDialog } from "~/routes/($lang)._main.users.$user/components/profile-edit-dialog"
import { UserActionShare } from "~/routes/($lang)._main.users.$user/components/user-action-share"
import { UserActionOther } from "~/routes/($lang)._main.users.$user/components/user-action-other"
import { RefreshCcwIcon } from "lucide-react"
import { AppConfirmDialog } from "~/components/app/app-confirm-dialog"
import { useNavigate } from "@remix-run/react"
import { toOmissionNumberText } from "~/utils/to-omission-number-text"
import type { UserProfileIconFragment } from "~/routes/($lang)._main.users.$user/components/user-profile-name-icon"

type Props = {
  user: FragmentOf<typeof UserProfileIconFragment>
  userId: string
  isSensitive?: boolean
}

export function UserHomeMain(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: userInfo } = useQuery(userQuery, {
    variables: {
      userId: decodeURIComponent(props.userId),
    },
  })

  const isFollow = userInfo?.user?.isFollowee ?? false

  const isMute = userInfo?.user?.isMuted ?? false

  const navigate = useNavigate()

  return (
    <div className="relative m-auto h-72 w-full md:h-24">
      <div className="absolute top-2 right-0 z-10 md:hidden">
        <div className="flex space-x-2">
          {props.isSensitive ? (
            <Button
              onClick={() => {
                navigate(`/users/${props.user.login}`)
              }}
              variant={"secondary"}
            >
              <div className="flex cursor-pointer items-center">
                <RefreshCcwIcon className="mr-1 w-3" />
                <p className="text-sm">{"全年齢"}</p>
              </div>
            </Button>
          ) : (
            <AppConfirmDialog
              title={"確認"}
              description={
                "センシティブな作品を表示します、あなたは18歳以上ですか？"
              }
              onNext={() => {
                navigate(`/r/users/${props.user.login}`)
              }}
              cookieKey={"check-sensitive-ranking"}
              onCancel={() => {}}
            >
              <Button variant={"secondary"}>
                <div className="flex cursor-pointer items-center">
                  <RefreshCcwIcon className="mr-1 w-3" />
                  <p className="text-sm">{"対象年齢"}</p>
                </div>
              </Button>
            </AppConfirmDialog>
          )}
          <UserActionShare login={props.user.login} name={props.user.name} />
        </div>
      </div>
      <div className="absolute top-2 right-0 hidden md:block">
        <div className="flex w-full items-center justify-end space-x-4">
          {props.isSensitive ? (
            <Button
              onClick={() => {
                navigate(`/users/${props.user.login}`)
              }}
              variant={"secondary"}
            >
              <div className="flex cursor-pointer items-center">
                <RefreshCcwIcon className="mr-1 w-3" />
                <p className="text-sm">{"全年齢"}</p>
              </div>
            </Button>
          ) : (
            <AppConfirmDialog
              title={"確認"}
              description={
                "センシティブな作品を表示します、あなたは18歳以上ですか？"
              }
              onNext={() => {
                navigate(`/r/users/${props.user.login}`)
              }}
              cookieKey={"check-sensitive-ranking"}
              onCancel={() => {}}
            >
              <Button variant={"secondary"}>
                <div className="flex cursor-pointer items-center">
                  <RefreshCcwIcon className="mr-1 w-3" />
                  <p className="text-sm">{"対象年齢"}</p>
                </div>
              </Button>
            </AppConfirmDialog>
          )}
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
      <div className="absolute top-24 left-0 flex w-[100%] flex-col space-y-1 px-8 md:hidden">
        <div className="mb-4 flex md:mb-0 md:hidden">
          <div className="w-32">
            <div className="white mt-4 font-bold text-md">
              {toOmissionNumberText(props.user.followersCount)}
            </div>
            <div className="white mt-1 text-sm opacity-50">{"フォロワー"}</div>
          </div>
          <div className="w-32">
            <div className="white mt-4 font-bold text-md">
              {toOmissionNumberText(props.user.receivedLikesCount)}
            </div>
            <div className="white mt-1 text-sm opacity-50">{"いいね"}</div>
          </div>
        </div>
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
    followersCount
    receivedLikesCount
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
