import { useEffect, useState, useContext, useCallback } from "react"
import { Heart } from "lucide-react"
import { cn } from "~/lib/utils"
import { AuthContext } from "~/contexts/auth-context"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { KeyCodes } from "~/config"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  text?: string
  onClick?: (liked: boolean) => void
  defaultLiked?: boolean
  defaultLikedCount: number
  likedCount?: number
  targetWorkId: string
  targetWorkOwnerUserId: string
  isUsedShortcutKey?: boolean
  isTargetUserBlocked?: boolean
}

/**
 * ダイアログ専用のいいねボタン - 幅いっぱいクリックできる領域
 */
export function DialogLikeButton (props: Props): React.ReactNode {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const [createWorkLike, { loading: isCreateLoading }] = useMutation(
    createWorkLikeMutation,
  )
  const [deleteWorkLike, { loading: isDeleteLoading }] = useMutation(
    deleteWorkLikeMutation,
  )

  // ローカルストレージのキー
  const localStorageKey = `work_like_${props.targetWorkId}`

  // ローカルストレージから状態を取得する関数
  const getLocalLikeState = useCallback(() => {
    if (typeof window === "undefined") return null
    try {
      const stored = localStorage.getItem(localStorageKey)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }, [localStorageKey])

  // ローカルストレージに状態を保存する関数
  const setLocalLikeState = useCallback(
    (liked: boolean, count: number) => {
      if (typeof window === "undefined") return
      try {
        localStorage.setItem(localStorageKey, JSON.stringify({ liked, count }))
      } catch {
        // ローカルストレージが使用できない場合は無視
      }
    },
    [localStorageKey],
  )

  // 状態管理
  const [isLiked, setIsLiked] = useState(props.defaultLiked ?? false)
  const [likedCount, setLikedCount] = useState(props.defaultLikedCount)
  const [clicked, setClicked] = useState(false)

  // targetWorkIdが変更されたときの処理
  useEffect(() => {
    const localState = getLocalLikeState()
    if (localState !== null) {
      setIsLiked(localState.liked)
      setLikedCount(localState.count)
    } else {
      setIsLiked(props.defaultLiked ?? false)
      setLikedCount(props.defaultLikedCount)
    }
  }, [
    props.targetWorkId,
    getLocalLikeState,
    props.defaultLiked,
    props.defaultLikedCount,
  ])

  // propsが変更されたときにローカルストレージの状態がない場合のみ更新
  useEffect(() => {
    const localState = getLocalLikeState()
    if (localState === null) {
      setIsLiked(props.defaultLiked ?? false)
      setLikedCount(props.defaultLikedCount)
    }
  }, [props.defaultLiked, props.defaultLikedCount, getLocalLikeState])

  // クリックハンドラー
  const handleOnClick = useCallback(
    async (e: { preventDefault: () => void }) => {
      e.preventDefault()

      if (props.onClick) {
        props.onClick(!isLiked)
      }

      // 楽観的更新でローカル状態を即座に更新
      const newIsLiked = !isLiked
      const newLikedCount = newIsLiked ? likedCount + 1 : likedCount - 1

      // クリック状態を設定（初回クリック時のみ）
      if (!clicked) setClicked(true)

      setIsLiked(newIsLiked)
      setLikedCount(newLikedCount)

      // ローカルストレージに保存
      setLocalLikeState(newIsLiked, newLikedCount)

      try {
        if (newIsLiked) {
          await createWorkLike({
            variables: {
              input: {
                workId: props.targetWorkId,
              },
            },
          })
        } else {
          await deleteWorkLike({
            variables: {
              input: {
                workId: props.targetWorkId,
              },
            },
          })
        }
      } catch (error) {
        // エラー時はローカル状態を元に戻す
        setIsLiked(!newIsLiked)
        setLikedCount(newIsLiked ? likedCount - 1 : likedCount + 1)
        setLocalLikeState(
          !newIsLiked,
          newIsLiked ? likedCount - 1 : likedCount + 1,
        )
        console.error("Failed to update like status:", error)
      }
    },
    [
      isLiked,
      likedCount,
      clicked,
      props,
      setLocalLikeState,
      createWorkLike,
      deleteWorkLike,
    ],
  )

  // キーボードショートカット処理
  const handleFavoritedKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        !authContext.isLoggedIn ||
        authContext.isLoading ||
        props.isTargetUserBlocked
      ) {
        return
      }

      if (event.key === KeyCodes.F) {
        event.preventDefault()
        handleOnClick({ preventDefault: () => {} })
      }
    },
    [
      authContext.isLoggedIn,
      authContext.isLoading,
      props.isTargetUserBlocked,
      handleOnClick,
    ],
  )

  useEffect(() => {
    if (props.isUsedShortcutKey) {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", handleFavoritedKeyDown)
        document.addEventListener("keydown", handleFavoritedKeyDown)
      }
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", handleFavoritedKeyDown)
      }
    }
  }, [props.targetWorkId, props.isUsedShortcutKey, handleFavoritedKeyDown])

  // ログインしていない場合
  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return (
      <LoginDialogButton
        label={t("いいね", "Like")}
        isLoading={authContext.isLoading || authContext.isLoggedIn}
        isWidthFull={true}
        description={t(
          "ログインして、いいねしてみましょう！",
          "Log in and try liking it!",
        )}
        triggerChildren={
          <div className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-secondary/30 py-2 transition-colors hover:bg-secondary/50">
            <div className="flex items-center space-x-2">
              <Heart
                size={20}
                strokeWidth={1.5}
                fill="white"
                stroke="#9CA3AF"
              />
              {props.text && (
                <span className="font-medium text-sm">{props.text}</span>
              )}
            </div>
          </div>
        }
      />
    )
  }

  // ログイン済みの場合
  return (
    <button
      type="button"
      onClick={handleOnClick}
      disabled={isCreateLoading || isDeleteLoading || props.isTargetUserBlocked}
      className={cn(
        "flex w-full cursor-pointer items-center justify-center rounded-lg py-2 transition-all duration-200",
        {
          "bg-pink-50/80 hover:bg-pink-100/80 dark:bg-pink-950/50 dark:hover:bg-pink-900/50":
            isLiked,
          "bg-secondary/30 hover:bg-secondary/50": !isLiked,
          "cursor-not-allowed opacity-50":
            isCreateLoading || isDeleteLoading || props.isTargetUserBlocked,
        },
      )}
    >
      <div className="flex items-center space-x-2">
        <Heart
          className={cn(
            "transition-all duration-200",
            clicked ? (isLiked ? "like-animation" : "like-animation-end") : "",
          )}
          size={20}
          strokeWidth={1.5}
          fill={isLiked ? "#E2264D" : "transparent"}
          stroke={isLiked ? "#E2264D" : "#9CA3AF"}
        />
        {props.text && (
          <span
            className={cn(
              "font-medium text-sm transition-colors duration-200",
              isLiked
                ? "text-pink-600 dark:text-pink-400"
                : "text-muted-foreground",
            )}
          >
            {props.text}
          </span>
        )}
      </div>
    </button>
  )
}

const createWorkLikeMutation = graphql(
  `mutation CreateWorkLike($input: CreateWorkLikeInput!) {
    createWorkLike(input: $input) {
      id
      likesCount
      isLiked
    }
  }`,
)

const deleteWorkLikeMutation = graphql(
  `mutation DeleteWorkLike($input: DeleteWorkLikeInput!) {
    deleteWorkLike(input: $input) {
      id
      likesCount
      isLiked
    }
  }`,
)
