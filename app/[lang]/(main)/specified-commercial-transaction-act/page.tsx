import { SctaDocument } from "app/[lang]/(main)/specified-commercial-transaction-act/_components/SctaDocument"
import { MainPage } from "app/_components/pages/MainPage"
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
