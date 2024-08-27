import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { config } from "~/config"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { getMessaging, getToken } from "firebase/messaging"
import { graphql } from "gql.tada"
import { CircleCheckBigIcon, Loader2Icon, XIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"

/**
 * WebFCMTokenを更新するフォーム
 */
export function SettingFcmForm() {
  if (!("Notification" in window)) {
    return "PCブラウザに対応しています。スマートフォンのブラウザには対応していません。"
  }

  const [mutation, { loading: isLoading }] = useMutation(
    updateAccountWebFcmTokenMutation,
  )

  const appContext = useContext(AuthContext)

  const { data = null } = useSuspenseQuery(viewerUserQuery, {
    skip: appContext.isLoading,
  })

  const [webFcmToken, setWebFcmToken] = useState(data?.viewer?.user.webFcmToken)

  const [isLoadingNotifySetting, setIsLoadingNotifySetting] = useState(false)

  const onClick = async () => {
    try {
      setIsLoadingNotifySetting(true)

      const token = await getToken(getMessaging(), {
        vapidKey: config.fcm.vapidKey,
      })

      // tokenを保存する
      await mutation({
        variables: {
          input: {
            token: token,
          },
        },
      }).then(async (result) => {
        toast("通知を受信する設定をしました。")
        setWebFcmToken(token)
        setIsLoadingNotifySetting(false)
      })
    } catch (error) {
      setIsLoadingNotifySetting(false)
    }
    setIsLoadingNotifySetting(false)
  }

  const onDeleteToken = async () => {
    try {
      setIsLoadingNotifySetting(true)

      // tokenを削除する
      await mutation({
        variables: {
          input: {
            token: null,
          },
        },
      }).then(async (result) => {
        toast("通知を受信する設定を解除しました。")
        setWebFcmToken(null)
        setIsLoadingNotifySetting(false)
      })
    } catch (error) {
      setIsLoadingNotifySetting(false)
    }
    setIsLoadingNotifySetting(false)
  }

  const onClickTestNotify = async () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("テスト通知", {
            body: "テスト通知",
            icon: "https://www.aipictors.com/wp-content/uploads/notification_thumbnail.png",
          })
        } else {
          toast("通知設定がOFFです。")
        }
      })
    } else {
      toast("このデバイスは通知をサポートしていません。")
    }
  }

  return (
    <>
      <div>
        <Button
          onClick={onClick}
          disabled={isLoadingNotifySetting}
          className="mr-4"
        >
          {"通知を受信する"}
          {isLoadingNotifySetting && (
            <Loader2Icon className="ml-2 h-4 w-4 animate-spin" />
          )}
        </Button>

        {webFcmToken && (
          <Button
            onClick={onDeleteToken}
            disabled={isLoadingNotifySetting}
            className="mr-4"
            variant={"secondary"}
          >
            {"Push通知解除"}
            {isLoadingNotifySetting && (
              <Loader2Icon className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        )}

        <Button
          onClick={onClickTestNotify}
          disabled={isLoading}
          variant={"secondary"}
        >
          {"テスト通知"}
        </Button>
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            {Notification.permission !== "granted" ? (
              <>
                <XIcon className="h-4 w-4" />
                <span className="text-sm">ブラウザの通知設定がOFF</span>
              </>
            ) : (
              <>
                <CircleCheckBigIcon className="h-4 w-4" />
                <span className="text-sm">ブラウザの通知設定がON</span>
              </>
            )}
          </div>
          <div className="flex items-center">
            {!data?.viewer?.user.webFcmToken && !webFcmToken ? (
              <>
                <XIcon className="h-4 w-4" />
                <span className="text-sm">
                  通知に必要な情報をサーバに未送信
                </span>
              </>
            ) : (
              <>
                <CircleCheckBigIcon className="h-4 w-4" />
                <span className="text-sm">
                  通知に必要な情報をサーバに送信済み
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const viewerUserQuery = graphql(
  `query ViewerUser {
    viewer {
      id
      user {
        id
        biography
        login
        name
        awardsCount
        followersCount
        followCount
        iconUrl
        headerImageUrl
        webFcmToken
        generatedCount
        promptonUser {
          id
          name
        }
        receivedLikesCount
        receivedViewsCount
        createdLikesCount
        createdViewsCount
        createdCommentsCount
        createdBookmarksCount
      }
    }
  }`,
)

const updateAccountWebFcmTokenMutation = graphql(
  `mutation UpdateAccountWebFcmToken($input: UpdateAccountWebFcmTokenInput!) {
    updateAccountWebFcmToken(input: $input) {
      id
    }
  }`,
)
