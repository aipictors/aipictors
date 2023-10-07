import type { Metadata } from "next"
import { MainPage } from "app/components/MainPage"
import { PrivacyDocument } from "app/privacy/components/PrivacyDocument"

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
