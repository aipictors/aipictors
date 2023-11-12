import { AboutDocument } from "@/app/[lang]/(main)/about/_components/about-document"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

/**
 * サイトについて
 * @returns
 */
const AboutPage = async () => {
  return (
    <MainPage>
      <AboutDocument />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AboutPage
