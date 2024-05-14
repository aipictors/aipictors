import { Button } from "@/_components/ui/button"
import { config } from "@/config"
import { getMessaging, getToken } from "firebase/messaging"

export const SettingFcmForm = () => {
  const onClick = async () => {
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

    /*
    // tokenを保存する
    const updateUserProfileWebFcmTokenMutation = gql(`
    mutation UpdateUserWebFcmToken($token: String!) {
      UpdateUserWebFcmToken(token: $token) {
        id
        web_fcm_token
      }
    }
    `)
    const [mutation] = useMutation(updateUserProfileWebFcmTokenMutation)

    const handleUpdate = async (token: string) => {
      await mutation({
        variables: {
          input: {
            token: token,
          },
        },
      })
    }
    */
  }

  return (
    <>
      <Button onClick={onClick}>{"通知を受信する"}</Button>
    </>
  )
}
