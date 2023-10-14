import { MainSettingStickersDownloads } from "app/[lang]/(main)/settings/stickers/downloads/components/MainSettingStickersDownloads"
import type { Metadata } from "next"

const StickersDownloadsPage = async () => {
  return <MainSettingStickersDownloads />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersDownloadsPage
