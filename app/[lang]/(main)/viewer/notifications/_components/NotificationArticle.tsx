"use client"
import { Stack } from "@chakra-ui/react"
import { NotificationList } from "app/[lang]/(main)/viewer/notifications/_components/NotificationList"
import { NotificationTab } from "app/[lang]/(main)/viewer/notifications/_components/NotificationTab"

export const NotificationArticle: React.FC = () => {
  return (
    <Stack>
      <NotificationTab />
      <NotificationList />
    </Stack>
  )
}
