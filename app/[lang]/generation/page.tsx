import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { GenerationForm } from "@/app/[lang]/generation/_components/generation-form"
import type { Metadata } from "next"
import dynamic from "next/dynamic"

/**
 * 画像生成
 * @returns
 */
const GenerationPage = async () => {
  /**
   * 利用規約
   */
  const termsMarkdownText = await readFile(
    join(process.cwd(), "assets/image-generation-terms.md"),
    "utf-8",
  )

  return <GenerationForm termsMarkdownText={termsMarkdownText} />
}

const siteName = "無料AIイラスト生成 - スマホ対応"
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

export const revalidate = 10

const GenerationConfigView = dynamic(
  () => {
    return import(
      "@/app/[lang]/generation/_components/config-view/generation-config-view"
    )
  },
  { ssr: false },
)

export default GenerationPage
