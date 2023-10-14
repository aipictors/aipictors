import { PrivacyDocument } from "app/[lang]/(main)/privacy/components/PrivacyDocument"
import { MainPage } from "app/components/MainPage"
import type { Metadata } from "next"

const PrivacyPage = async () => {
  return (
    <MainPage>
      <PrivacyDocument />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default PrivacyPage
