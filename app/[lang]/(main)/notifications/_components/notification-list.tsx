"use client"

import { NotificationListItem } from "@/app/[lang]/(main)/notifications/_components/notification-list-item"
import { Stack } from "@chakra-ui/react"

export const NotificationList = () => {
  return (
    <Stack>
      <NotificationListItem />
    </Stack>
  )
}
