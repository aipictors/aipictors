import { useEffect, useState, useContext, useCallback } from "react"
import { Heart } from "lucide-react"
import { cn } from "~/lib/cn"
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

  const [isLiked, setIsLiked] = useState(props.defaultLiked)

  const [likedCount, setLikedCount] = useState(props.defaultLikedCount)

  /**
   * Fキーでいいね
   */
  const handleFavoritedKeyDown = useCallback((event: KeyboardEvent) => {
    // 入力欄やテキストエリアにフォーカスしている場合は何もしない
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
  }, [])

  useEffect(() => {
    if (props.isUsedShortcutKey) {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", handleFavoritedKeyDown)
        document.addEventListener("keydown", handleFavoritedKeyDown)
      }
    }
  }, [props.targetWorkId])

  useEffect(() => {
    setIsLiked(props.defaultLiked)
    setLikedCount(props.defaultLikedCount)
  }, [props.defaultLiked, props.defaultLikedCount, props.targetWorkId])

  const handleOnClick = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (props.onClick) {
      props.onClick(!isLiked)
    }

    try {
      if (!isLiked) {
        await createWorkLike({
          variables: {
            input: {
              workId: props.targetWorkId,
            },
          },
        }).then(() => {
          setIsLiked(true)
          // setLikedCount((prevCount) => prevCount + 1)
        })
      } else {
        await deleteWorkLike({
          variables: {
            input: {
              workId: props.targetWorkId,
            },
          },
        }).then(() => {
          setIsLiked(false)
          // setLikedCount((prevCount) => prevCount - 1)
        })
      }
    } catch (error) {
      console.error("Error updating like status", error)
    }
  }

  /* 自分自身の作品の場合はいいねボタンを表示しない */
  if (authContext.userId === props.targetWorkOwnerUserId) {
    return null
  }

  const width = Math.floor((props.size ?? 40) * 24)

  const size = props.size ?? 40

  /* 未ログイン */
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
          <button
            className={`${
              props.isParticle ? "like-button " : ""
            }relative flex items-center justify-center rounded-md ${
              props.isBackgroundNone
                ? ""
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              // biome-ignore lint/nursery/useSortedClasses: <explanation>
            } ${isCreateLoading || isDeleteLoading ? "opacity-50" : ""}`}
            style={{
              width: props.text
                ? "auto"
                : `${size - (props.isBackgroundNone ? 8 : 0)}px`,
              height: `${size - (props.isBackgroundNone ? 8 : 0)}px`,
            }}
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
                    : props.isBackgroundNone
                      ? "fill-white "
                      : "fill-transparent ",
                  isLiked ? "like-animation" : "like-animation-end",
                  "stroke-2",
                )}
                size={Math.floor(size / 2)}
                strokeWidth={props.strokeWidth}
                stroke={
                  props.isBackgroundNone
                    ? isLiked
                      ? "none"
                      : "gray"
                    : "currentColor"
                }
              />
            </div>
            {props.text && (
              <div className={cn("flex space-x-1 pr-3 font-bold text-sm")}>
                <p>{props.text}</p>
                <p>{likedCount}</p>
              </div>
            )}
          </button>
        }
      />
    )
  }

  return (
    <button
      className={`${
        props.isParticle ? "like-button " : ""
      }relative flex items-center justify-center rounded-md ${
        props.isBackgroundNone
          ? ""
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
      } ${isCreateLoading || isDeleteLoading ? "opacity-50" : ""}`}
      style={{
        width: props.text
          ? "auto"
          : `${size - (props.isBackgroundNone ? 8 : 0)}px`,
        height: `${size - (props.isBackgroundNone ? 8 : 0)}px`,
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
              : props.isBackgroundNone
                ? "fill-white "
                : "fill-transparent ",
            isLiked ? "like-animation" : "like-animation-end",
            "stroke-2",
          )}
          size={Math.floor(size / 2)}
          strokeWidth={props.strokeWidth}
          stroke={
            props.isBackgroundNone
              ? isLiked
                ? "none"
                : "gray"
              : "currentColor"
          }
        />
      </div>
      {props.text !== undefined && (
        <div
          className={cn(
            "flex space-x-1 pr-3 font-bold text-sm",
            props.textColor
              ? props.textColor === "black"
                ? "text-black"
                : "text-white"
              : "",
          )}
        >
          <p>{props.text}</p>
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
