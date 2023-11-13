import { AboutUsDocument } from "@/app/[lang]/(main)/about/us/_components/about-us-document"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

/**
 * 組織について
 * @returns
 */
const AboutUsPage = async () => {
  return (
    <MainPage>
      <AboutUsDocument />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AboutUsPage
