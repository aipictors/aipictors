import { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const TermsPage = async () => {
  return <PagePlaceholder>{"利用規約"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default TermsPage
