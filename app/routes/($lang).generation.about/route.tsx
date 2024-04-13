import type { Metadata } from "next"

/**
 * 画像生成・LP
 * @returns
 */
export default function GenerationAbout() {
  return <GenerationAbout />
}

const siteName = "無料AIイラスト生成について - スマホ対応"
const description =
  "無料で画像生成することができます。1日無料30枚でたくさん生成できます。LoRA、ControlNetにも対応、多数のモデルからお気に入りのイラストを生成できます。生成した画像はすぐに投稿したり、自由に利用したりすることができます。"
export const metadata: Metadata = {
  title: siteName,
  description,
  openGraph: {
    title: siteName,
    description,
    siteName,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    site: "@aipictors",
    creator: "@aipictors",
  },
}
