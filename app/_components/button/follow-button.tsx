import { followUserMutation } from "@/_graphql/mutations/follow-user"
import { unFollowUserMutation } from "@/_graphql/mutations/un-follow-user"
import { useMutation } from "@apollo/client/index"
import { useContext, useState } from "react"
import { AuthContext } from "@/_contexts/auth-context"
import { LoginDialogButton } from "@/_components/login-dialog-button"
import { cn } from "@/_lib/cn"

type Props = {
  targetUserId: string
  isFollow: boolean
  className?: string
  triggerChildren?: React.ReactNode
  unFollowTriggerChildren?: React.ReactNode
}

/**
 * フォロー
 */
export const FollowButton = (props: Props) => {
  const authContext = useContext(AuthContext)

  const triggerNode = props.triggerChildren ?? (
    <button
      type="button"
      onClick={() => {}}
      className={
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        `h-8 w-full rounded-2xl bg-clear-bright-blue p-1 text-white transition duration-500 hover:opacity-80 ${props.className}`
      }
    >
      {"フォローする"}
    </button>
  )

  const unFollowTriggerNode = props.unFollowTriggerChildren ?? (
    <button
      type="button"
      onClick={() => {}}
      className={
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        `h-8 w-full rounded-2xl bg-gray-500 opacity-50 p-1 text-white transition duration-500 hover:opacity-30 ${props.className}`
      }
    >
      {"フォロー中"}
    </button>
  )

  /* 未ログイン */
  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return (
      <LoginDialogButton
        label="フォロー"
        isLoading={authContext.isLoading || authContext.isLoggedIn}
        isWidthFull={true}
        description={"ユーザフォローして投稿を確認してみましょう！"}
        triggerChildren={triggerNode}
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
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      onClick={() => {
        if (isFollowing || isUnFollowing) return
        onUnFollow()
      }}
      className={cn(isFollowing || isUnFollowing ? "opacity-80" : "")}
    >
      {unFollowTriggerNode}
    </div>
  ) : (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      onClick={() => {
        if (isFollowing || isUnFollowing) return
        onFollow()
      }}
      className={cn(isFollowing || isUnFollowing ? "opacity-80" : "")}
    >
      {triggerNode}
    </div>
  )
}
