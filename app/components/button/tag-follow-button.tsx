import { useMutation } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { cn } from "~/lib/cn"
import { graphql } from "gql.tada"
import { toast } from "sonner"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"

type Props = {
  tag: string
  isFollow: boolean
  className?: string
  triggerChildren?: React.ReactNode
  unFollowTriggerChildren?: React.ReactNode
}

/**
 * タグお気に入り登録
 */
export const TagFollowButton = (props: Props) => {
  const authContext = useContext(AuthContext)

  const [isFollow, setIsFollow] = useState(props.isFollow)

  useEffect(() => {
    setIsFollow(props.isFollow)
  }, [props.isFollow])

  const [follow, { loading: isFollowing }] = useMutation(followTagMutation)
  const [unFollow, { loading: isUnFollowing }] =
    useMutation(unfollowTagMutation)

  const onFollow = async () => {
    try {
      const res = await follow({
        variables: {
          input: {
            tagName: props.tag,
          },
        },
      })
      setIsFollow(true)
    } catch (e) {
      console.error(e)
      toast.error("お気に入り登録に失敗しました")
    }
  }

  const onUnFollow = async () => {
    try {
      const res = await unFollow({
        variables: {
          input: {
            tagName: props.tag,
          },
        },
      })
      setIsFollow(false)
    } catch (e) {
      console.error(e)
      toast.error("お気に入り解除に失敗しました")
    }
  }

  const triggerNode = props.triggerChildren ?? (
    <button
      type="button"
      onClick={onFollow}
      className={cn(
        "h-10 w-full rounded-full bg-clear-bright-blue p-1 font-bold text-white transition duration-500 hover:opacity-80",
        props.className,
      )}
    >
      {"お気に入り登録"}
    </button>
  )

  const unFollowTriggerNode = props.unFollowTriggerChildren ?? (
    <button
      type="button"
      onClick={onUnFollow}
      className={cn(
        "h-10 w-full rounded-full bg-gray-500 p-1 font-bold text-white opacity-50 transition duration-500 hover:opacity-30",
        props.className,
      )}
    >
      {"お気に入り解除"}
    </button>
  )

  /* 未ログイン */
  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return (
      <LoginDialogButton
        label="お気に入り登録"
        isLoading={authContext.isLoading || authContext.isLoggedIn}
        isWidthFull={true}
        description={"タグをお気に入り登録して投稿を確認してみましょう！"}
        triggerChildren={triggerNode}
      />
    )
  }

  if (!props.tag) {
    return null
  }

  return (
    <div className="flex w-full items-center space-x-2">
      <CrossPlatformTooltip
        text={
          "タグのついた新着作品をタイムラインでチェックできるようになります"
        }
      />
      {isFollow ? (
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
      )}
    </div>
  )
}

const followTagMutation = graphql(
  `mutation FollowTag($input: FollowTagInput!) {
    followTag(input: $input)
  }`,
)

const unfollowTagMutation = graphql(
  `mutation UnFollowTag($input: UnFollowTagInput!) {
    unFollowTag(input: $input)
  }`,
)
