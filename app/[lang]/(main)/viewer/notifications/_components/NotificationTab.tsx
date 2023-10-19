"use client"
import { Button, Divider, HStack, Stack } from "@chakra-ui/react"

export const NotificationTab: React.FC = () => {
  return (
    <Stack>
      <HStack>
        <Button isActive>{"すべて"}</Button>
        <Button>{"いいね"}</Button>
        <Button>{"コメント"}</Button>
        <Button>{"返信"}</Button>
        <Button>{"フォロー"}</Button>
        <Button>{"ランキング"}</Button>
      </HStack>
      <Divider />
    </Stack>
  )
}
