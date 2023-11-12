import { DownloadStickerList } from "@/app/[lang]/(main)/stickers/downloads/_components/download-sticker-list"
import type { Metadata } from "next"

/**
 * ダウンロードしたスタンプの一覧
 * @returns
 */
const StickersDownloadsPage = async () => {
  return <DownloadStickerList />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersDownloadsPage
