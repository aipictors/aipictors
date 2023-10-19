import { TermsDocument } from "app/[lang]/(main)/terms/_components/TermsDocument"
import { MainPage } from "app/_components/MainPage"
import type { Metadata } from "next"

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
