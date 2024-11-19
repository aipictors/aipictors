"use client"

import { useMutation } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { cn } from "~/lib/utils"
import { graphql } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { toast } from "sonner"

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
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)

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
      toast.success(t("フォローしました", "You have followed the user"))
    } catch (e) {
      console.error(e)
      toast.error(t("フォローに失敗しました", "Failed to follow the user"))
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
      toast.success(
        t("フォローを解除しました", "You have un followed the user"),
      )
      setIsOpen(false)
    } catch (e) {
      console.error(e)
      toast.error(
        t("フォロー解除に失敗しました", "Failed to un follow the user"),
      )
    }
  }

  const triggerNode = props.triggerChildren ?? (
    <button
      type="button"
      onClick={() => {}}
      className={`h-8 w-full rounded-full bg-clear-bright-blue p-1 font-bold text-white transition duration-500 hover:opacity-80 ${props.className}`}
    >
      {t("フォローする", "Follow")}
    </button>
  )

  const unFollowTriggerNode = props.unFollowTriggerChildren ?? (
    <button
      type="button"
      onClick={() => {}}
      className={`h-8 w-full rounded-full bg-gray-500 p-1 font-bold text-white opacity-50 transition duration-500 hover:opacity-30 ${props.className}`}
    >
      {t("フォロー中", "Following")}
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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div
          onClick={() => {
            if (isFollowing || isUnFollowing) return
            setIsOpen(true)
          }}
          className={cn(isFollowing || isUnFollowing ? "opacity-80" : "")}
        >
          {unFollowTriggerNode}
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("確認", "Confirm")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "本当にフォローを解除しますか？",
              "Are you sure you want to unfollow?",
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)}>
            {t("キャンセル", "Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onUnFollow}>
            {t("解除する", "Unfollow")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
