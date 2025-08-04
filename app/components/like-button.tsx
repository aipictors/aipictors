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
  size?: number
  text?: string
  textColor?: "black" | "white" | null
  onClick?: (liked: boolean) => void
  defaultLiked?: boolean
  defaultLikedCount: number
  likedCount?: number
  targetId?: string
  targetWorkId: string
  targetWorkOwnerUserId: string
  isBackgroundNone?: boolean
  strokeWidth?: number
  isParticle?: boolean
  isUsedShortcutKey?: boolean
  isTargetUserBlocked?: boolean
}

export function LikeButton(props: Props) {
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
        // ローカルストレージへの保存に失敗した場合は無視
      }
    },
    [localStorageKey],
  )

  // SSR安全な初期状態設定
  const [isLiked, setIsLiked] = useState(props.defaultLiked ?? false)
  const [likedCount, setLikedCount] = useState(props.defaultLikedCount)

  // クライアントサイドでのみローカルストレージから状態を復元
  useEffect(() => {
    const localState = getLocalLikeState()
    if (localState !== null) {
      setIsLiked(localState.liked)
      setLikedCount(localState.count)
    }
  }, [])
  const [clicked, setClicked] = useState(false)

  const handleFavoritedKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const tagName = document.activeElement?.tagName.toLowerCase()
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        isLiked ||
        props.defaultLiked
      ) {
        return
      }
      if (event.code === KeyCodes.F) {
        handleOnClick(event)
      }
    },
    [isLiked, props.defaultLiked],
  )

  useEffect(() => {
    if (props.isUsedShortcutKey) {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", handleFavoritedKeyDown)
        document.addEventListener("keydown", handleFavoritedKeyDown)
      }
    }
  }, [props.targetWorkId, handleFavoritedKeyDown])

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

  const handleOnClick = async (e: { preventDefault: () => void }) => {
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
      if (!isLiked) {
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
      console.error("Error updating like status", error)

      // エラーが発生した場合は状態を元に戻す
      setIsLiked(isLiked)
      setLikedCount(likedCount)
      setLocalLikeState(isLiked, likedCount)
    }
  }

  if (authContext.userId === props.targetWorkOwnerUserId) {
    return null
  }

  if (props.isTargetUserBlocked) {
    return (
      <div className="rounded-md bg-gray-100 p-2 text-center text-gray-600 text-sm dark:bg-gray-800 dark:text-gray-400">
        {t(
          "ブロック中のユーザーの作品にはいいねできません",
          "Cannot like works from blocked users",
        )}
      </div>
    )
  }

  const width = Math.floor((props.size ?? 40) * 25)
  const size = props.size ?? 40

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
          <div
            className={cn(
              props.isParticle && "like-button",
              "relative flex cursor-pointer items-center justify-center",
              {
                "bg-secondary text-secondary-foreground hover:bg-secondary/80":
                  !props.isBackgroundNone,
                "opacity-50": isCreateLoading || isDeleteLoading,
              },
            )}
            style={{
              width: props.text ? "auto" : `${size}px`,
              height: `${size}px`,
              paddingLeft: props.text ? `${size}px` : "0",
              paddingRight: props.text ? "12px" : "0",
            }}
          >
            <div
              className={cn(
                "like-base-64 absolute inset-0 flex items-center justify-center rounded-full",
                isLiked ? "hover:bg-pink-50" : "hover:bg-gray-50",
              )}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundSize: `auto ${size}px`,
                transition: "background-position steps(25)",
                transitionDuration: isLiked ? "1s" : "0s",
                backgroundPosition: isLiked ? `-${width}px 0` : "0 0",
              }}
            >
              <Heart
                className={cn(
                  clicked
                    ? isLiked
                      ? "like-animation"
                      : "like-animation-end"
                    : "",
                )}
                size={Math.floor(size / 2)}
                strokeWidth={1.5}
                fill={isLiked ? "#E2264D" : "white"}
                stroke={isLiked ? "#E2264D" : "#9CA3AF"}
              />
            </div>
            {props.text && (
              <span className="font-bold text-black text-sm">{props.text}</span>
            )}
          </div>
        }
      />
    )
  }

  return (
    <button
      className={cn(
        props.isParticle && "like-button",
        "relative flex items-center justify-center",
        {
          "bg-secondary text-secondary-foreground hover:bg-secondary/80":
            !props.isBackgroundNone,
          "opacity-50": isCreateLoading || isDeleteLoading,
        },
      )}
      style={{
        width: props.text ? "auto" : `${size}px`,
        height: `${size}px`,
        paddingLeft: props.text ? `${size}px` : "0",
        paddingRight: props.text ? "12px" : "0",
      }}
      onClick={handleOnClick}
      type="button"
    >
      <div
        className={cn(
          "like-base-64 absolute inset-0 flex items-center justify-center rounded-full",
          isLiked ? "hover:bg-pink-50" : "hover:bg-gray-50",
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundSize: `auto ${size}px`,
          transition: "background-position steps(25)",
          transitionDuration: isLiked ? "1s" : "0s",
          backgroundPosition: isLiked ? `-${width}px 0` : "0 0",
        }}
      >
        <Heart
          className={cn(
            clicked ? (isLiked ? "like-animation" : "like-animation-end") : "",
          )}
          size={Math.floor(size / 2)}
          strokeWidth={1.5}
          fill={isLiked ? "#E2264D" : "white"}
          stroke={isLiked ? "#E2264D" : "#9CA3AF"}
        />
      </div>
      {props.text && (
        <span className="font-bold text-black text-sm">{props.text}</span>
      )}
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
