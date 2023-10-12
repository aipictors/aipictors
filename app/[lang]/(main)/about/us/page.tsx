import type { Metadata } from "next"
import { UsDocument } from "app/[lang]/(main)/about/us/components/UsDocument"
import { MainPage } from "app/components/MainPage"

const AboutUsPage = async () => {
  return (
    <MainPage>
      <UsDocument />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AboutUsPage
