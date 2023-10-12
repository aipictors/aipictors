import type { Metadata } from "next"
import { MainSettingStickersDownloads } from "app/[lang]/(main)/settings/stickers/downloads/components/MainSettingStickersDownloads"

const StickersDownloadsPage = async () => {
  return <MainSettingStickersDownloads />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersDownloadsPage
