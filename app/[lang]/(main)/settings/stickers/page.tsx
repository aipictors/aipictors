import { MainSettingStickers } from "app/[lang]/(main)/settings/stickers/components/MainSettingStickers"
import type { Metadata } from "next"

const StickersPage = async () => {
  return <MainSettingStickers />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersPage
