import type { Metadata } from "next"
import { MainSettingStickers } from "app/(main)/settings/stickers/components/MainSettingStickers"

const StickersPage = async () => {
  return <MainSettingStickers />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersPage
