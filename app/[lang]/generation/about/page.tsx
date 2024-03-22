import { GenerationAbout } from "@/app/[lang]/generation/about/_components/generation-about"
import type { Metadata } from "next"

/**
 * 画像生成・LP
 * @returns
 */
const GenerationAboutPage = async () => {
  return (
    <GenerationAbout />
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GenerationAboutPage
