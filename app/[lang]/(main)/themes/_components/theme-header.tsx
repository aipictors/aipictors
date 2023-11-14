"use client"
import { ThemeCard } from "@/app/[lang]/(main)/themes/_components/theme-card"
import { Button, Divider, HStack, Stack, Text } from "@chakra-ui/react"

export const ThemeHeader = () => {
  return (
    <Stack>
      <Text fontSize={"lg"}>{"創作アイディアページ"}</Text>
      <Text fontSize={"sm"}>
        {
          "お題を毎日更新しています。AIイラストをテーマに沿って作成して投稿してみましょう。午前0時に更新されます。"
        }
      </Text>
      <Divider />
      <Stack>
        <HStack>
          <Text fontSize={"sm"}>{"今日のお題「」"}</Text>
          <Button fontSize={"sm"}>{"お題を見る"}</Button>
        </HStack>
        <Text fontSize={"sm"}>{"新着順"}</Text>
        <HStack>
          <ThemeCard />
          <ThemeCard />
          <ThemeCard />
          <ThemeCard />
        </HStack>
      </Stack>
      <Divider />
    </Stack>
  )
}
