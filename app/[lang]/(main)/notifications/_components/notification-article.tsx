"use client"

import { NotificationList } from "@/app/[lang]/(main)/notifications/_components/notification-list"
import { NotificationTab } from "@/app/[lang]/(main)/notifications/_components/notification-tab"
import { Stack } from "@chakra-ui/react"

export const NotificationArticle = () => {
  return (
    <Stack>
      <NotificationTab />
      <NotificationList />
    </Stack>
  )
}
