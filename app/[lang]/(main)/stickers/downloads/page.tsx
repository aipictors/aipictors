import { DownloadStickerList } from "app/[lang]/(main)/stickers/downloads/_components/DownloadStickerList"
import type { Metadata } from "next"

const StickersDownloadsPage = async () => {
  return <DownloadStickerList />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersDownloadsPage
