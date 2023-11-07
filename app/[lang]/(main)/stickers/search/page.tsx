import { Stack, Text } from "@chakra-ui/react"

import StickerSearchForm from "app/[lang]/(main)/stickers/_components/StickerSearchForm"
import { createClient } from "app/_contexts/client"
import type { Metadata } from "next"

/**
 * スタンプの検索画面
 * @returns
 */
const StickersSearchPage = async () => {
  const client = createClient()

  return (
    <Stack>
      <Text>{"キーワードでスタンプを検索できます"}</Text>
      <StickerSearchForm />
    </Stack>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersSearchPage
