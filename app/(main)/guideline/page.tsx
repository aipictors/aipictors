import type { Metadata } from "next"
import { GuidelineDocument } from "app/(main)/guideline/components/GuidelineDocument"
import { MainPage } from "app/components/MainPage"

const GuidelinePage = async () => {
  return (
    <MainPage>
      <GuidelineDocument />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default GuidelinePage
