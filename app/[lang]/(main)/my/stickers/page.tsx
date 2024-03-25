import { MyStickers } from "@/app/[lang]/(main)/my/stickers/_components/my-stickers"
import type { Metadata } from "next"

const MyStickersPage = async () => {
  return <MyStickers />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default MyStickersPage
