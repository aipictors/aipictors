import type { Metadata } from "next"
import { redirect } from "next/navigation"

/**
 * スタンプの検索画面
 * @returns
 */
const StickersSearchPage = async () => {
  redirect("/stickers")
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersSearchPage
