import { useMutation } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { cn } from "~/lib/cn"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"

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
export function FollowButton(props: Props) {
  const authContext = useContext(AuthContext)

  const [isFollow, setIsFollow] = useState(props.isFollow)

  const t = useTranslation()

  useEffect(() => {
    setIsFollow(props.isFollow)
  }, [props.isFollow])

  const [follow, { loading: isFollowing }] = useMutation(followUserMutation)

  const [unFollow, { loading: isUnFollowing }] =
    useMutation(unfollowUserMutation)

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

  const triggerNode = props.triggerChildren ?? (
    <button
      type="button"
      onClick={() => {}}
      className={
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        `h-8 w-full font-bold rounded-full bg-clear-bright-blue p-1 text-white transition duration-500 hover:opacity-80 ${props.className}`
      }
    >
      {t("フォローする", "follow")}
    </button>
  )

  const unFollowTriggerNode = props.unFollowTriggerChildren ?? (
    <button
      type="button"
      onClick={() => {}}
      className={
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        `h-8 w-full font-bold rounded-full bg-gray-500 opacity-50 p-1 text-white transition duration-500 hover:opacity-30 ${props.className}`
      }
    >
      {t("フォロー中", "following")}
    </button>
  )

  /* 未ログイン */
  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return (
      <LoginDialogButton
        label={t("フォローする", "Follow")}
        isLoading={authContext.isLoading || authContext.isLoggedIn}
        isWidthFull={true}
        description={t(
          "ログインして、フォローしてみましょう！",
          "Log in and try following!",
        )}
        triggerChildren={triggerNode}
      />
    )
  }

  /* 自分自身の場合はフォローボタンを表示しない */
  if (authContext.userId === props.targetUserId) {
    return null
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
