import type { Metadata } from "next"
import { MainPage } from "app/components/MainPage"
import { TermsDocument } from "app/terms/component/TermsDocument"

const TermsPage = async () => {
  return (
    <MainPage>
      <TermsDocument />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default TermsPage
