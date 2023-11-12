import { SctaDocument } from "app/[lang]/(main)/specified-commercial-transaction-act/_components/scta-document"
import { MainPage } from "app/_components/page/main-page"
import type { Metadata } from "next"

const SctaPage = async () => {
  return (
    <MainPage>
      <SctaDocument />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SctaPage
