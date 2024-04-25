import React, { useEffect } from "react"
import { Heart } from "lucide-react"
import { cn } from "@/_lib/utils"
import { useContext } from "react"
import { AuthContext } from "@/_contexts/auth-context"
import { LoginDialogButton } from "@/_components/login-dialog-button"
import { useMutation } from "@apollo/client/index.js"
import { createWorkLikeMutation } from "@/_graphql/mutations/create-work-like"
import { deleteWorkLikeMutation } from "@/_graphql/mutations/delete-work-like"

type LikeButtonProps = {
  size?: number
  text?: string
  onClick?: (arg0: boolean) => void
  defaultLiked?: boolean
  defaultLikedCount: number
  likedCount?: number
  targetId?: string
  targetWorkId: string
  targetWorkOwnerUserId: string
  isBackgroundNone?: boolean
  strokeWidth?: number
}

export const LikeButton = ({
  size = 40,
  defaultLiked = false,
  defaultLikedCount,
  text,
  onClick,
  targetWorkId,
  targetWorkOwnerUserId,
  isBackgroundNone = true,
  strokeWidth = 1,
}: LikeButtonProps) => {
  const authContext = useContext(AuthContext)

  /* 未ログイン */
  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return (
      <LoginDialogButton
        label="いいね"
        isLoading={authContext.isLoading || authContext.isLoggedIn}
        isWidthFull={true}
        description={"ログインして、いいねしてみましょう！"}
        triggerChildren={
          <button
            className="relative flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
            style={{
              width: text ? "auto" : `${size}px`,
              height: `${size}px`,
              paddingLeft: text ? `${size}px` : "0",
            }}
            onClick={() => {}}
            type="button"
          >
            <div
              className={cn(
                "like-image absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-full",
              )}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundSize: `auto ${size}px`,
                transition: "background-position steps(25)",
                transitionDuration: "0s",
                backgroundPosition: "0 0",
              }}
            >
              <Heart
                className={"fill-transparent text-black dark:text-white"}
                size={Math.floor(size / 2)}
                strokeWidth={1}
              />
            </div>
            {text && (
              <span className={cn("mr-3 text-black text-sm dark:text-white")}>
                {text}
              </span>
            )}
          </button>
        }
      />
    )
  }

  const [createWorkLike, { loading: isCreateLoading }] = useMutation(
    createWorkLikeMutation,
  )

  const [deleteWorkLike, { loading: isDeleteLoading }] = useMutation(
    deleteWorkLikeMutation,
  )

  const width = Math.floor(size * 24)

  const [isLiked, setIsLiked] = React.useState(false)

  const [clicked, setClicked] = React.useState(false)

  const [likedCount, setLikedCount] = React.useState(0)

  useEffect(() => {
    setIsLiked(defaultLiked)
    setLikedCount(defaultLikedCount)
  }, [])

  const handleOnClick = async () => {
    if (onClick) {
      onClick(!isLiked)
    }

    if (!isLiked) {
      await createWorkLike({
        variables: {
          input: {
            workId: targetWorkId,
          },
        },
      })
    } else {
      await deleteWorkLike({
        variables: {
          input: {
            workId: targetWorkId,
          },
        },
      })
    }

    setIsLiked(!isLiked)
    setClicked(!clicked)
    if (isLiked) {
      setLikedCount(likedCount - 1)
    } else {
      setLikedCount(likedCount + 1)
    }
    // if (!clicked) setClicked(true)
  }

  /* 自分自身の作品の場合はいいねボタンを表示しない */
  if (authContext.userId === targetWorkOwnerUserId) {
    return null
  }

  return (
    <button
      // If props.isBackgroundNone is true, set no background color.
      // biome-ignore lint/nursery/useSortedClasses: <explanation>
      className={`relative flex items-center justify-center rounded-md ${
        isBackgroundNone
          ? ""
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
      } ${isCreateLoading || isDeleteLoading ? "opacity-50" : ""}`}
      style={{
        width: text ? "auto" : `${size}px`,
        height: `${size}px`,
        paddingLeft: text ? `${size}px` : "0",
      }}
      onClick={handleOnClick}
      type="button"
    >
      <div
        className={cn(
          "like-image top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-full",
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
            isLiked
              ? "fill-pink-400 text-pink-400"
              : isBackgroundNone
                ? "fill-white text-black dark:text-white"
                : "fill-transparent text-black dark:text-white",
            clicked ? (isLiked ? "like-animation" : "like-animation-end") : "",
          )}
          size={Math.floor(size / 2)}
          strokeWidth={strokeWidth}
          stroke={isBackgroundNone ? "black" : "currentColor"}
        />
      </div>
      {text && (
        <span className={cn("mr-3 text-black text-sm dark:text-white")}>
          {text}
          {likedCount}
        </span>
      )}
    </button>
  )
}
