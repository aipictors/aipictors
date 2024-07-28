import { useEffect, useState, useContext } from "react"
import { Heart } from "lucide-react"
import { cn } from "@/lib/cn"
import { AuthContext } from "@/contexts/auth-context"
import { LoginDialogButton } from "@/components/login-dialog-button"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"

type LikeButtonProps = {
  size?: number
  text?: string
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
  isParticle = false,
}: LikeButtonProps) => {
  const authContext = useContext(AuthContext)
  const [createWorkLike, { loading: isCreateLoading }] = useMutation(
    createWorkLikeMutation,
  )
  const [deleteWorkLike, { loading: isDeleteLoading }] = useMutation(
    deleteWorkLikeMutation,
  )
  const [isLiked, setIsLiked] = useState(defaultLiked)
  const [likedCount, setLikedCount] = useState(defaultLikedCount)

  useEffect(() => {
    setIsLiked(defaultLiked)
    setLikedCount(defaultLikedCount)
  }, [defaultLiked, defaultLikedCount, targetWorkId])

  const handleOnClick = async () => {
    if (onClick) {
      onClick(!isLiked)
    }

    try {
      if (!isLiked) {
        await createWorkLike({
          variables: {
            input: {
              workId: targetWorkId,
            },
          },
        }).then(() => {
          setIsLiked(!isLiked)
          setLikedCount((prevCount) => prevCount + 1)
        })
      } else {
        await deleteWorkLike({
          variables: {
            input: {
              workId: targetWorkId,
            },
          },
        }).then(() => {
          setIsLiked(!isLiked)
          setLikedCount((prevCount) => prevCount - 1)
        })
      }
    } catch (error) {
      console.error("Error updating like status", error)
    }
  }

  /* 自分自身の作品の場合はいいねボタンを表示しない */
  if (authContext.userId === targetWorkOwnerUserId) {
    return null
  }

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
            className={
              isBackgroundNone
                ? "relative flex items-center justify-center rounded-md text-secondary-foreground"
                : "relative flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }
            style={{
              width: text ? "auto" : `${size - (isBackgroundNone ? 8 : 0)}px`,
              height: `${size - (isBackgroundNone ? 8 : 0)}px`,
              paddingLeft: text ? `${size}px` : "0",
            }}
            onClick={() => {}}
            type="button"
          >
            <div
              className={cn(
                "absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-full",
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
                className={"fill-white text-black dark:text-white"}
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

  const width = Math.floor(size * 24)

  return (
    <button
      className={`${
        isParticle ? "like-button " : ""
      }relative flex items-center justify-center rounded-md ${
        isBackgroundNone
          ? ""
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
      } ${isCreateLoading || isDeleteLoading ? "opacity-50" : ""}`}
      style={{
        width: text ? "auto" : `${size - (isBackgroundNone ? 8 : 0)}px`,
        height: `${size - (isBackgroundNone ? 8 : 0)}px`,
      }}
      onClick={handleOnClick}
      type="button"
    >
      <div
        className={cn(
          "top-0 right-0 bottom-0 left-0 flex items-center justify-center rounded-full",
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
              ? "fill-rose-500 text-rose-500"
              : isBackgroundNone
                ? "fill-white "
                : "fill-transparent ",
            isLiked ? "like-animation" : "like-animation-end",
          )}
          size={Math.floor(size / 2)}
          strokeWidth={strokeWidth}
          stroke={isBackgroundNone ? "black" : "currentColor"}
        />
      </div>
      {text && (
        <div className={cn("mr-4 flex space-x-1 text-sm ")}>
          <p>{text}</p>
          <p>{likedCount}</p>
        </div>
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
