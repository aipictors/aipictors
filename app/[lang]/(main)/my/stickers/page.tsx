import { MyStickers } from "app/[lang]/(main)/my/stickers/_components/MyStickers"
import type { Metadata } from "next"

const MyStickersPage = async () => {
  return <MyStickers />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MyStickersPage
