import { useMutation } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { cn } from "~/lib/utils"
import { graphql } from "gql.tada"
import { toast } from "sonner"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { useTranslation } from "~/hooks/use-translation" // 翻訳対応

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
export function TagFollowButton(props: Props) {
  const t = useTranslation() // 翻訳フック
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
      toast.error(t("お気に入り登録に失敗しました", "Failed to follow tag"))
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
      toast.error(t("お気に入り解除に失敗しました", "Failed to unfollow tag"))
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
      {t("お気に入り登録", "Follow")}
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
      {t("お気に入り解除", "Unfollow")}
    </button>
  )

  /* 未ログイン */
  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return (
      <LoginDialogButton
        label={t("お気に入り登録", "Follow")}
        isLoading={authContext.isLoading || authContext.isLoggedIn}
        isWidthFull={true}
        description={t(
          "タグをお気に入り登録して投稿を確認してみましょう！",
          "Follow tags to see related posts!",
        )}
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
        text={t(
          "タグのついた新着作品をタイムラインでチェックできるようになります",
          "You can check new works with this tag in your timeline",
        )}
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
  `mutation UnFollowTag($input: UnfollowTagInput!) {
    unfollowTag(input: $input)
  }`,
)
