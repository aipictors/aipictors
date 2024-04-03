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

export const metadata: Metadata = {
  robots: { index: false },
  title: "画像生成",
  description:
    "簡単に高品質なAI画像生成を行うことができます、1日無料30枚でたくさん生成できます",
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
