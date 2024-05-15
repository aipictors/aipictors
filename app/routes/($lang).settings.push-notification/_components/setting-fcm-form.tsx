import { Button } from "@/_components/ui/button"
import { AuthContext } from "@/_contexts/auth-context"
import { updateAccountWebFcmTokenMutation } from "@/_graphql/mutations/update-account-web-fcm-token"
import { viewerUserQuery } from "@/_graphql/queries/viewer/viewer-user"
import { config } from "@/config"
import { useMutation, useSuspenseQuery } from "@apollo/client/index"
import { getMessaging, getToken } from "firebase/messaging"
import { CircleCheckBigIcon, Loader2Icon, XIcon } from "lucide-react"
import { useContext, useState } from "react"
import { toast } from "sonner"

/**
 * WebFCMTokenを更新するフォーム
 */
export const SettingFcmForm = () => {
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
      console.log(token)

      // 取得したtokenを使ってブラウザにテスト通知メッセージを表示する
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification("テスト通知", {
          body: "テスト通知メッセージ",
          icon: "https://www.aipictors.com/wp-content/uploads/notification_thumbnails/aipictors_square_logo.png",
          data: {},
        })
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

  const onClickTestNotify = async () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("テスト通知", {
        body: "テスト通知メッセージ",
        icon: "https://www.aipictors.com/wp-content/uploads/notification_thumbnails/aipictors_square_logo.png",
        data: {},
      })
    })
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
