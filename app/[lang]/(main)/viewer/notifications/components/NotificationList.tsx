"use client"
import { Stack } from "@chakra-ui/react"
import { NotificationListItem } from "app/[lang]/(main)/viewer/notifications/components/NotificationListItem"

export const NotificationList: React.FC = () => {
  return (
    <Stack>
      <NotificationListItem />
    </Stack>
  )
}
