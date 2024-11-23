import { FollowButton } from "~/components/button/follow-button"
import { Button } from "~/components/ui/button"
import { PromptonRequestColorfulButton } from "~/routes/($lang)._main.posts.$post._index/components/prompton-request-colorful-button"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useQuery } from "@apollo/client/index"
import { ProfileEditDialog } from "~/routes/($lang)._main.users.$user._index/components/profile-edit-dialog"
import { UserActionShare } from "~/routes/($lang)._main.users.$user._index/components/user-action-share"
import { UserActionOther } from "~/routes/($lang)._main.users.$user._index/components/user-action-other"
import { useNavigate } from "react-router";
import { toOmissionNumberText } from "~/utils/to-omission-number-text"
import { useTranslation } from "~/hooks/use-translation"
import { SensitiveConfirmDialog } from "~/routes/($lang)._main.users.$user._index/components/sensitive-confirm-dialog"
import { Heart } from "lucide-react"

type Props = {
  user: FragmentOf<typeof UserHomeMenuFragment>
}

export function UserHomeMenu(props: Props) {
  const cachedUser = readFragment(UserHomeMenuFragment, props.user)

  const authContext = useContext(AuthContext)

  const { data = null } = useQuery(UserQuery, {
    variables: { userId: decodeURIComponent(cachedUser.id) },
  })

  const user = readFragment(UserHomeMenuFragment, data?.user)

  const t = useTranslation()

  const isFollowee = user?.isFollowee ?? false

  const isMuted = user?.isMuted ?? false

  const navigate = useNavigate()

  return (
    <div className="relative m-auto h-72 w-full md:h-24">
      <div className="absolute top-2 right-0 z-10 md:hidden">
        <div className="flex space-x-2">
          {cachedUser.receivedSensitiveLikesCount > 0 && (
            <Button
              onClick={() => {
                navigate(`/r/users/${cachedUser.login}`)
              }}
              variant={"secondary"}
            >
              <div className="flex cursor-pointer items-center">
                <Heart className="mr-2 h-5 w-4" />
                {cachedUser.receivedSensitiveLikesCount}
                <p>{t("センシティブ", "Sensitive")}</p>
              </div>
            </Button>
          )}
          <UserActionShare login={cachedUser.login} name={cachedUser.name} />
        </div>
      </div>
      <div className="absolute top-2 right-0 hidden md:block">
        <div className="flex w-full items-center justify-end space-x-4">
          {cachedUser.receivedSensitiveLikesCount > 0 && (
            <SensitiveConfirmDialog
              receivedSensitiveLikesCount={
                cachedUser.receivedSensitiveLikesCount
              }
              userLogin={cachedUser.login}
            />
          )}
          <UserActionOther id={cachedUser.id} isMuted={isMuted} />
          <UserActionShare login={cachedUser.login} name={cachedUser.name} />
          <FollowButton
            targetUserId={cachedUser.id}
            isFollow={isFollowee}
            triggerChildren={
              <Button className="font-bold">
                {t("フォローする", "Follow")}
              </Button>
            }
            unFollowTriggerChildren={
              <Button variant={"secondary"}>
                {t("フォロー中", "Following")}
              </Button>
            }
          />
          {typeof user?.promptonUser?.id === "string" && (
            <PromptonRequestColorfulButton
              rounded="rounded-md"
              promptonId={user.promptonUser.id}
              targetUserId={user.id}
            />
          )}
          {authContext.userId === cachedUser.id && (
            <ProfileEditDialog
              triggerChildren={<Button>{t("編集", "Edit")}</Button>}
            />
          )}
        </div>
      </div>
      <div className="absolute top-24 left-0 flex w-[100%] flex-col space-y-1 px-8 md:hidden">
        <div className="mb-4 flex md:mb-0 md:hidden">
          <div className="w-32">
            <div className="white mt-4 font-bold text-md">
              {toOmissionNumberText(cachedUser.followersCount)}
            </div>
            <div className="white mt-1 text-sm opacity-50">
              {t("フォロワー", "Followers")}
            </div>
          </div>
          <div className="w-32">
            <div className="white mt-4 font-bold text-md">
              {toOmissionNumberText(cachedUser.receivedLikesCount)}
            </div>
            <div className="white mt-1 text-sm opacity-50">
              {t("いいね", "Liked")}
            </div>
          </div>
        </div>
        {authContext.userId !== cachedUser.id && (
          <FollowButton
            className="mb-2 w-[100%] rounded-full"
            targetUserId={"2"}
            isFollow={isFollowee}
          />
        )}
        {cachedUser.promptonUser !== null &&
          cachedUser.promptonUser.id !== null && (
            <div className={"block w-[100%] rounded-full"}>
              <PromptonRequestColorfulButton
                rounded="rounded-full"
                promptonId={cachedUser.promptonUser.id}
                hideIcon={true}
                targetUserId={cachedUser.id}
              />
            </div>
          )}
        {authContext.userId === cachedUser.id && (
          <ProfileEditDialog
            triggerChildren={
              <Button className="w-full rounded-full">
                {t("プロフィール編集", "Edit Profile")}
              </Button>
            }
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
