"use client"

import { Stack } from "@chakra-ui/react"
import { NotificationList } from "app/[lang]/(main)/notifications/_components/notification-list"
import { NotificationTab } from "app/[lang]/(main)/notifications/_components/notification-tab"

export const NotificationArticle: React.FC = () => {
  return (
    <Stack>
      <NotificationTab />
      <NotificationList />
    </Stack>
  )
}
