import { followUserMutation } from "@/_graphql/mutations/follow-user"
import { unFollowUserMutation } from "@/_graphql/mutations/un-follow-user"
import { useMutation } from "@apollo/client/index"
import { useContext, useState } from "react"
import { AuthContext } from "@/_contexts/auth-context"
import { LoginDialogButton } from "@/_components/login-dialog-button"

type Props = {
  targetUserId: string
  isFollow: boolean
}

/**
 * フォロー
 * @param props
 * @returns
 */
export const FollowButton = (props: Props) => {
  const authContext = useContext(AuthContext)

  /* 未ログイン */
  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return (
      <LoginDialogButton
        label="フォロー"
        isLoading={authContext.isLoading || authContext.isLoggedIn}
        isWidthFull={true}
        description={"ユーザフォローして投稿を確認してみましょう！"}
        triggerChildren={
          <button
            type="button"
            onClick={() => {}}
            className={
              "h-9 rounded-2xl bg-clear-bright-blue p-1 text-white transition duration-500 hover:opacity-80"
            }
          >
            {"フォローする"}
          </button>
        }
      />
    )
  }

  /* 自分自身の場合はフォローボタンを表示しない */
  if (authContext.userId === props.targetUserId) {
    return null
  }

  const [isFollow, setIsFollow] = useState(props.isFollow)

  const [follow, { loading: isFollowing }] = useMutation(followUserMutation)

  const [unFollow, { loading: isUnFollowing }] =
    useMutation(unFollowUserMutation)

  const onFollow = async () => {
    try {
      const res = await follow({
        variables: {
          input: {
            userId: props.targetUserId,
          },
        },
      })
      setIsFollow(res.data?.followUser?.isFollowee ?? false)
    } catch (e) {
      console.error(e)
    }
  }

  const onUnFollow = async () => {
    try {
      const res = await unFollow({
        variables: {
          input: {
            userId: props.targetUserId,
          },
        },
      })
      setIsFollow(res.data?.unfollowUser?.isFollowee ?? false)
    } catch (e) {
      console.error(e)
    }
  }

  return isFollow ? (
    <button
      type="button"
      onClick={onUnFollow}
      disabled={isUnFollowing}
      // biome-ignore lint/nursery/useSortedClasses: <explanation>
      className={`h-9 rounded-2xl bg-gray-500 opacity-50 p-1 text-white transition duration-500${
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        " "
      }${isUnFollowing ? "opacity-20" : "hover:opacity-30"}`}
    >
      {"フォロー中"}
    </button>
  ) : (
    <button
      type="button"
      onClick={onFollow}
      disabled={isFollowing}
      className={`h-9 rounded-2xl bg-clear-bright-blue p-1 text-white transition duration-500${
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        " "
      }${isFollowing ? "opacity-20" : "hover:opacity-80"}`}
    >
      {"フォローする"}
    </button>
  )
}
