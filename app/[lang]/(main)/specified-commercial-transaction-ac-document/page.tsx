import { SctaDocument } from "app/[lang]/(main)/specified-commercial-transaction-ac-document/component/SctaDocument"
import { MainPage } from "app/components/MainPage"
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
