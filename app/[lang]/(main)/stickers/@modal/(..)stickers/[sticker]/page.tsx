import { StickerModal } from "@/app/[lang]/(main)/stickers/@modal/(..)stickers/[sticker]/_components/sticker-modal"
import type { Metadata } from "next"

/**
 * スタンプの詳細
 * @returns
 */
const StickerPage = async () => {
  return <StickerModal />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default StickerPage
