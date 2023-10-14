import { UsDocument } from "app/[lang]/(main)/about/us/components/UsDocument"
import { MainPage } from "app/components/MainPage"
import type { Metadata } from "next"

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
