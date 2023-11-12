"use client"

import { Stack } from "@chakra-ui/react"
import { NotificationListItem } from "app/[lang]/(main)/notifications/_components/notification-list-item"

export const NotificationList: React.FC = () => {
  return (
    <Stack>
      <NotificationListItem />
    </Stack>
  )
}
