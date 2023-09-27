import type { Metadata } from "next"
import { TermsDocument } from "app/(main)/terms/component/TermsDocument"
import { MainPage } from "app/components/MainPage"

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
