import { useMutation } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { cn } from "~/lib/cn"
import { graphql } from "gql.tada"
import { toast } from "sonner"

type Props = {
  tag: string
  isFollow: boolean
  className?: string
  triggerChildren?: React.ReactNode
  unFollowTriggerChildren?: React.ReactNode
}

/**
 * タグフォロー
 */
export const TagFollowButton = (props: Props) => {
  const authContext = useContext(AuthContext)

  const [isFollow, setIsFollow] = useState(props.isFollow)

  useEffect(() => {
    setIsFollow(props.isFollow)
  }, [props.isFollow])

  const [follow, { loading: isFollowing }] = useMutation(followUserMutation)

  const [unFollow, { loading: isUnFollowing }] =
    useMutation(unfollowUserMutation)

  const onFollow = async () => {
    toast("メンテナンス中です")
    // try {
    //   const res = await follow({
    //     variables: {
    //       input: {
    //         userId: props.targetUserId,
    //       },
    //     },
    //   })
    //   setIsFollow(res.data?.followUser?.isFollowee ?? false)
    // } catch (e) {
    //   console.error(e)
    // }
  }

  const onUnFollow = async () => {
    toast("メンテナンス中です")
    // try {
    //   const res = await unFollow({
    //     variables: {
    //       input: {
    //         userId: props.targetUserId,
    //       },
    //     },
    //   })
    //   setIsFollow(res.data?.unfollowUser?.isFollowee ?? false)
    // } catch (e) {
    //   console.error(e)
    // }
  }

  const triggerNode = props.triggerChildren ?? (
    <button
      type="button"
      disabled={true}
      onClick={() => {}}
      className={
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        `h-10 w-full font-bold rounded-full bg-clear-bright-blue p-1 text-white transition duration-500 hover:opacity-80 ${props.className}`
      }
    >
      {"お気に入り登録"}
    </button>
  )

  const unFollowTriggerNode = props.unFollowTriggerChildren ?? (
    <button
      type="button"
      disabled={true}
      onClick={() => {}}
      className={
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        `h-10 w-full font-bold rounded-full bg-gray-500 opacity-50 p-1 text-white transition duration-500 hover:opacity-30 ${props.className}`
      }
    >
      {"お気に入り解除"}
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

  if (!props.tag) {
    return null
  }

  return isFollow ? (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      onClick={() => {
        if (isFollowing || isUnFollowing) return
        onUnFollow()
      }}
      className={cn(
        isFollowing || isUnFollowing ? "w-full opacity-80" : " w-full",
      )}
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
      className={cn(
        isFollowing || isUnFollowing ? "w-full opacity-80" : " w-full",
      )}
    >
      {triggerNode}
    </div>
  )
}

const followUserMutation = graphql(
  `mutation FollowUser($input: FollowUserInput!) {
    followUser(input: $input) {
      id
      isFollowee
    }
  }`,
)

const unfollowUserMutation = graphql(
  `mutation UnfollowUser($input: UnfollowUserInput!) {
    unfollowUser(input: $input) {
      id
      isFollowee
    }
  }`,
)
