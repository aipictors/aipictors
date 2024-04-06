"use client"

import { Button } from "@/components/ui/button"
import { config } from "@/config"
import { getMessaging, getToken } from "firebase/messaging"

export function SettingFcmForm() {
  const onClick = async () => {
    const token = await getToken(getMessaging(), {
      vapidKey: config.fcm.vapidKey,
    })
    alert(token)
  }

  return <Button onClick={onClick}>{"FCMトークンを取得する"}</Button>
}
