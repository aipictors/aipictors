import { PrivacyDocument } from "app/[lang]/(main)/privacy/_components/PrivacyDocument"
import { MainPage } from "app/_components/MainPage"
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
