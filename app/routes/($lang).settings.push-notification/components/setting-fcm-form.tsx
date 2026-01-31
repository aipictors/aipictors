import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { config } from "~/config"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { getMessaging, getToken } from "firebase/messaging"
import { graphql } from "gql.tada"
import { CircleCheckBigIcon, Loader2Icon, XIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation" // 翻訳フックをインポート

/**
 * WebFCMTokenを更新するフォーム
 */
export function SettingFcmForm() {
  const t = useTranslation() // 翻訳フックを使用

  const [mutation, { loading: isLoading }] = useMutation(
    updateAccountWebFcmTokenMutation,
  )
  const appContext = useContext(AuthContext)

  const { data = null } = useSuspenseQuery(viewerUserQuery, {
    skip: appContext.isLoading,
  })

  const [webFcmToken, setWebFcmToken] = useState(data?.viewer?.user.webFcmToken)
  const [isLoadingNotifySetting, setIsLoadingNotifySetting] = useState(false)

  const isNotificationSupported =
    typeof window !== "undefined" && "Notification" in window

  if (!isNotificationSupported) {
    return t(
      "PCブラウザに対応しています。スマートフォンのブラウザには対応していません。",
      "Supported on PC browsers only. Not supported on smartphone browsers.",
    )
  }

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
      }).then(async () => {
        toast(
          t("通知を受信する設定をしました。", "Notification settings updated."),
        )
        setWebFcmToken(token)
        setIsLoadingNotifySetting(false)
      })
    } catch (_error) {
      setIsLoadingNotifySetting(false)
    }
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
      }).then(async () => {
        toast(
          t(
            "通知を受信する設定を解除しました。",
            "Notification settings removed.",
          ),
        )
        setWebFcmToken(null)
        setIsLoadingNotifySetting(false)
      })
    } catch (_error) {
      setIsLoadingNotifySetting(false)
    }
  }

  const onClickTestNotify = async () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(t("テスト通知", "Test Notification"), {
            body: t("テスト通知", "Test Notification"),
            icon: "https://www.aipictors.com/wp-content/uploads/notification_thumbnail.png",
          })
        } else {
          toast(t("通知設定がOFFです。", "Notifications are off."))
        }
      })
    } else {
      toast(
        t(
          "このデバイスは通知をサポートしていません。",
          "This device does not support notifications.",
        ),
      )
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
          {t("通知を受信する", "Enable Notifications")}
          {isLoadingNotifySetting && (
            <Loader2Icon className="ml-2 size-4 animate-spin" />
          )}
        </Button>

        {webFcmToken && (
          <Button
            onClick={onDeleteToken}
            disabled={isLoadingNotifySetting}
            className="mr-4"
            variant={"secondary"}
          >
            {t("Push通知解除", "Disable Push Notifications")}
            {isLoadingNotifySetting && (
              <Loader2Icon className="ml-2 size-4 animate-spin" />
            )}
          </Button>
        )}

        <Button
          onClick={onClickTestNotify}
          disabled={isLoading}
          variant={"secondary"}
        >
          {t("テスト通知", "Test Notification")}
        </Button>
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            {Notification.permission !== "granted" ? (
              <>
                <XIcon className="size-4" />
                <span className="text-sm">
                  {t(
                    "ブラウザの通知設定がOFF",
                    "Browser notifications are OFF",
                  )}
                </span>
              </>
            ) : (
              <>
                <CircleCheckBigIcon className="size-4" />
                <span className="text-sm">
                  {t("ブラウザの通知設定がON", "Browser notifications are ON")}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center">
            {!data?.viewer?.user.webFcmToken && !webFcmToken ? (
              <>
                <XIcon className="size-4" />
                <span className="text-sm">
                  {t(
                    "通知に必要な情報をサーバに未送信",
                    "Notification data not sent to server",
                  )}
                </span>
              </>
            ) : (
              <>
                <CircleCheckBigIcon className="size-4" />
                <span className="text-sm">
                  {t(
                    "通知に必要な情報をサーバに送信済み",
                    "Notification data sent to server",
                  )}
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
