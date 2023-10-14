import { AboutDocument } from "app/[lang]/(main)/about/components/AboutDocument"
import { MainPage } from "app/components/MainPage"
import type { Metadata } from "next"

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
