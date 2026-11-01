"use client"

import { useApolloClient } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { CheckIcon } from "lucide-react"
import {
  cloneElement,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { requestAchievementCheck } from "~/lib/achievements/achievement-ui"
import { cn } from "~/lib/utils"

type Props = {
  targetUserId: string
  isFollow: boolean
  /**
   * 相手にフォローされている（ボタンを「フォローバック」にする）
   */
  isFollower?: boolean
  /**
   * 解除したときの案内に出す名前
   */
  targetUserName?: string
  className?: string
  triggerChildren?: React.ReactNode
  unFollowTriggerChildren?: React.ReactNode
  /**
   * 押した直後（サーバの返事を待たずに）呼ばれる
   */
  onFollowChange?: (isFollow: boolean) => void
}

function enhanceTriggerNode(
  node: React.ReactNode,
  props: {
    onPress: () => void
  },
) {
  const onClick = (event: React.MouseEvent) => {
    // カードのリンクの中に置いても、ページが移らないようにする
    event.preventDefault()
    event.stopPropagation()
    props.onPress()
  }

  if (!isValidElement(node)) {
    return (
      <button type="button" onClick={onClick}>
        {node}
      </button>
    )
  }

  const originalOnClick = node.props.onClick as
    | ((event: React.MouseEvent) => void)
    | undefined

  return cloneElement(node, {
    onClick: (event: React.MouseEvent) => {
      originalOnClick?.(event)
      if (event.defaultPrevented) return
      onClick(event)
    },
  })
}

/**
 * フォローの状態を、押した瞬間に切り替える（サーバの返事は待たない）。
 * 返事を待つ間に何度押されても、最後に押された状態になるまで 1 件ずつ送る。
 * 失敗したときはサーバの状態に戻して知らせる
 */
function useOptimisticFollow(props: {
  targetUserId: string
  isFollow: boolean
  onFollowChange?: (isFollow: boolean) => void
}) {
  const client = useApolloClient()

  const t = useTranslation()

  const [isFollow, setIsFollow] = useState(props.isFollow)

  /** 押された状態 */
  const desiredRef = useRef(props.isFollow)

  /** サーバで確かめた状態 */
  const confirmedRef = useRef(props.isFollow)

  const isSendingRef = useRef(false)

  const onFollowChangeRef = useRef(props.onFollowChange)
  onFollowChangeRef.current = props.onFollowChange

  // 送っている間は、親から渡された古い値で上書きしない
  useEffect(() => {
    if (isSendingRef.current) return
    desiredRef.current = props.isFollow
    confirmedRef.current = props.isFollow
    setIsFollow(props.isFollow)
  }, [props.isFollow])

  const updateCache = useCallback(
    (nextIsFollow: boolean) => {
      const cacheId = client.cache.identify({
        __typename: "UserNode",
        id: props.targetUserId,
      })
      client.cache.modify({
        id: cacheId,
        fields: {
          isFollowee: () => nextIsFollow,
          followersCount: (count: number) =>
            Math.max(0, count + (nextIsFollow ? 1 : -1)),
        },
      })
    },
    [client, props.targetUserId],
  )

  const send = useCallback(async () => {
    if (isSendingRef.current) return
    isSendingRef.current = true
    try {
      while (desiredRef.current !== confirmedRef.current) {
        const nextIsFollow = desiredRef.current
        const input = { userId: props.targetUserId }
        const res = nextIsFollow
          ? await client.mutate({
              mutation: followUserMutation,
              variables: { input },
            })
          : await client.mutate({
              mutation: unfollowUserMutation,
              variables: { input },
            })
        const serverIsFollow = nextIsFollow
          ? (res.data?.followUser?.isFollowee ?? nextIsFollow)
          : (res.data?.unfollowUser?.isFollowee ?? nextIsFollow)
        if (serverIsFollow !== confirmedRef.current) {
          updateCache(serverIsFollow)
          if (serverIsFollow) requestAchievementCheck()
        }
        confirmedRef.current = serverIsFollow
        if (serverIsFollow !== nextIsFollow) {
          // サーバが受け付けなかった（ブロック中など）
          desiredRef.current = serverIsFollow
          setIsFollow(serverIsFollow)
          onFollowChangeRef.current?.(serverIsFollow)
        }
      }
    } catch (error) {
      console.error(error)
      const failedToFollow = desiredRef.current
      desiredRef.current = confirmedRef.current
      setIsFollow(confirmedRef.current)
      onFollowChangeRef.current?.(confirmedRef.current)
      toast.error(
        failedToFollow
          ? t(
              "フォローできませんでした。もう一度お試しください",
              "Failed to follow. Please try again",
            )
          : t(
              "フォローを解除できませんでした。もう一度お試しください",
              "Failed to unfollow. Please try again",
            ),
      )
    } finally {
      isSendingRef.current = false
    }
  }, [client, props.targetUserId, t, updateCache])

  const setFollow = useCallback(
    (nextIsFollow: boolean) => {
      desiredRef.current = nextIsFollow
      setIsFollow(nextIsFollow)
      onFollowChangeRef.current?.(nextIsFollow)
      send()
    },
    [send],
  )

  return { isFollow, setFollow }
}

/**
 * フォロー
 * 押すとすぐに切り替わる。解除は確認を出さず、すぐ解除して「元に戻す」を出す
 */
export function FollowButton(props: Props): React.ReactNode {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

  const { isFollow, setFollow } = useOptimisticFollow({
    targetUserId: props.targetUserId,
    isFollow: props.isFollow,
    onFollowChange: props.onFollowChange,
  })

  /** 押してフォローしたときだけ、チェックを弾ませる */
  const [isJustFollowed, setIsJustFollowed] = useState(false)

  useEffect(() => {
    if (!isJustFollowed) return
    const timer = setTimeout(() => setIsJustFollowed(false), 600)
    return () => clearTimeout(timer)
  }, [isJustFollowed])

  const onFollow = () => {
    setIsJustFollowed(true)
    setFollow(true)
  }

  const onUnFollow = () => {
    setFollow(false)
    toast(
      props.targetUserName
        ? t(
            `${props.targetUserName}さんのフォローを解除しました`,
            `Unfollowed ${props.targetUserName}`,
          )
        : t("フォローを解除しました", "Unfollowed"),
      {
        id: `unfollow-${props.targetUserId}`,
        action: {
          label: t("元に戻す", "Undo"),
          onClick: () => setFollow(true),
        },
      },
    )
  }

  const followLabel = props.isFollower
    ? t("フォローバック", "Follow back")
    : t("フォローする", "Follow")

  const triggerNode = props.triggerChildren ?? (
    <button
      type="button"
      className={cn(
        "h-8 w-full rounded-full bg-clear-bright-blue p-1 font-bold text-white transition hover:opacity-80 active:scale-95",
        props.className,
      )}
    >
      {followLabel}
    </button>
  )

  const unFollowTriggerNode = props.unFollowTriggerChildren ?? (
    <button
      type="button"
      className={cn(
        "group flex h-8 w-full items-center justify-center gap-1 rounded-full border border-border bg-secondary p-1 font-bold text-secondary-foreground transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive active:scale-95",
        props.className,
      )}
      aria-label={t(
        "フォロー中（押すと解除）",
        "Following (click to unfollow)",
      )}
    >
      <CheckIcon
        className={cn(
          "size-4 shrink-0 group-hover:hidden",
          isJustFollowed && "animate-follow-pop",
        )}
      />
      <span className="group-hover:hidden">{t("フォロー中", "Following")}</span>
      <span className="hidden group-hover:inline">
        {t("フォロー解除", "Unfollow")}
      </span>
    </button>
  )

  /* 未ログイン */
  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return (
      <LoginDialogButton
        label={followLabel}
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

  return isFollow
    ? enhanceTriggerNode(unFollowTriggerNode, { onPress: onUnFollow })
    : enhanceTriggerNode(triggerNode, { onPress: onFollow })
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
