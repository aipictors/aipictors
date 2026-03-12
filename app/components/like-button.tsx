import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Heart } from "lucide-react"
import { useCallback, useContext, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { KeyCodes } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { getDefaultLikeIsAnonymous } from "~/utils/like-visibility-preference"

type Props = {
  size?: number
  text?: string
  textColor?: "black" | "white" | null
  onClick?: (liked: boolean) => void
  defaultLiked?: boolean
  defaultLikedCount: number
  likedCount?: number
  targetId?: string
  isSensitive?: boolean
  targetWorkId: string
  targetWorkOwnerUserId: string
  isBackgroundNone?: boolean
  strokeWidth?: number
  isParticle?: boolean
  isUsedShortcutKey?: boolean
  isTargetUserBlocked?: boolean
  isChoiceDialogDisabled?: boolean
}

export function LikeButton(props: Props): React.ReactNode {
  const t = useTranslation()
  const location = useLocation()

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
  const [isChoiceDialogOpen, setIsChoiceDialogOpen] = useState(false)

  const isSensitive = props.isSensitive ?? /\/r($|\/)/.test(location.pathname)
  const [defaultIsAnonymous, setDefaultIsAnonymous] = useState(() =>
    getDefaultLikeIsAnonymous(isSensitive),
  )

  useEffect(() => {
    setDefaultIsAnonymous(getDefaultLikeIsAnonymous(isSensitive))
  }, [isSensitive])

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

  const performLike = async (_isAnonymous?: boolean) => {
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

  const handleOnClick = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (isLiked) {
      await performLike()
      return
    }

    if (props.isChoiceDialogDisabled) {
      await performLike(defaultIsAnonymous)
      return
    }

    setIsChoiceDialogOpen(true)
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
              "relative flex cursor-pointer items-center justify-center rounded-md",
              {
                "bg-secondary text-secondary-foreground hover:bg-secondary/80":
                  !props.isBackgroundNone,
                "opacity-50": isCreateLoading || isDeleteLoading,
              },
            )}
            style={{
              height: `${size}px`,
              minWidth: props.text ? "auto" : `${size}px`,
              paddingLeft: props.text ? "0" : "0",
              paddingRight: props.text ? "12px" : "0",
            }}
          >
            <div
              className={cn(
                "like-base-64 flex items-center justify-center rounded-full",
                isLiked ? "hover:bg-pink-50" : "hover:bg-gray-50",
              )}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundSize: `auto ${size}px`,
                transition: "background-position steps(25)",
                transitionDuration: isLiked ? "1s" : "0s",
                backgroundPosition: isLiked ? `-${width}px 0` : "0 0",
                flexShrink: 0,
                marginLeft: props.text ? "0" : "0",
                marginRight: props.text ? "0" : "0",
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
              <span className="whitespace-nowrap font-bold text-gray-700 text-sm dark:text-gray-300">
                {props.text}
              </span>
            )}
          </div>
        }
      />
    )
  }

  const defaultAction = defaultIsAnonymous
    ? {
        isAnonymous: true,
        label: t("匿名でいいね", "Like anonymously"),
        description: t(
          "作者通知やいいね一覧で名前を表示しません。",
          "Your name will not appear in author notifications or visible like lists.",
        ),
      }
    : {
        isAnonymous: false,
        label: t("名前を表示していいね", "Like with your name"),
        description: t(
          "作者通知やいいね一覧に名前が表示されます。",
          "Your name will appear in author notifications and visible like lists.",
        ),
      }

  const alternateAction = defaultIsAnonymous
    ? {
        isAnonymous: false,
        label: t("名前を表示していいね", "Like with your name"),
        description: t(
          "必要なときだけ名前を表示していいねできます。",
          "Use this if you want your name to be shown for this like.",
        ),
      }
    : {
        isAnonymous: true,
        label: t("匿名でいいね", "Like anonymously"),
        description: t(
          "必要なときだけ匿名いいねに切り替えられます。",
          "Use this if you want to hide your name for this like.",
        ),
      }

  return (
    <>
      <button
        className={cn(
          props.isParticle && "like-button",
          "relative flex items-center justify-center rounded-md",
          {
            "bg-secondary text-secondary-foreground hover:bg-secondary/80":
              !props.isBackgroundNone,
            "opacity-50": isCreateLoading || isDeleteLoading,
          },
        )}
        style={{
          height: `${size}px`,
          minWidth: props.text ? "auto" : `${size}px`,
          paddingLeft: props.text ? "0" : "0",
          paddingRight: props.text ? "12px" : "0",
        }}
        onClick={handleOnClick}
        type="button"
      >
        <div
          className={cn(
            "like-base-64 flex items-center justify-center rounded-full",
            isLiked ? "hover:bg-pink-50" : "hover:bg-gray-50",
          )}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundSize: `auto ${size}px`,
            transition: "background-position steps(25)",
            transitionDuration: isLiked ? "1s" : "0s",
            backgroundPosition: isLiked ? `-${width}px 0` : "0 0",
            flexShrink: 0,
            marginLeft: props.text ? "0" : "0",
            marginRight: props.text ? "0" : "0",
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
          <span className="whitespace-nowrap font-bold text-gray-700 text-sm dark:text-gray-300">
            {props.text}
          </span>
        )}
      </button>

      {!props.isChoiceDialogDisabled && (
        <Dialog open={isChoiceDialogOpen} onOpenChange={setIsChoiceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("いいね方法を選択", "Choose how to like")}
              </DialogTitle>
              <DialogDescription>
                {defaultIsAnonymous
                  ? t(
                      "センシティブ作品は匿名いいねが初期選択です。必要に応じて名前表示にも切り替えられます。",
                      "Sensitive works default to anonymous likes. You can switch to a named like when needed.",
                    )
                  : t(
                      "全年齢作品は名前表示のいいねが初期選択です。必要に応じて匿名にも切り替えられます。",
                      "All-ages works default to named likes. You can switch to anonymous when needed.",
                    )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                className="w-full justify-start whitespace-normal px-4 py-6 text-left"
                onClick={async () => {
                  setIsChoiceDialogOpen(false)
                  await performLike(defaultAction.isAnonymous)
                }}
              >
                <span className="flex flex-col items-start">
                  <span>{defaultAction.label}</span>
                  <span className="font-normal text-xs opacity-80">
                    {defaultAction.description}
                  </span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start whitespace-normal px-4 py-6 text-left"
                onClick={async () => {
                  setIsChoiceDialogOpen(false)
                  await performLike(alternateAction.isAnonymous)
                }}
              >
                <span className="flex flex-col items-start">
                  <span>{alternateAction.label}</span>
                  <span className="font-normal text-muted-foreground text-xs">
                    {alternateAction.description}
                  </span>
                </span>
              </Button>
              <p className="text-muted-foreground text-xs">
                {t(
                  "匿名いいねは作者への通知や作品のいいね一覧でユーザー名を表示しません。",
                  "Anonymous likes hide your name from author notifications and visible like lists.",
                )}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
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
