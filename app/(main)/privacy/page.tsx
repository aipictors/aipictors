import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const PrivacyPage = async () => {
  return <PagePlaceholder>{"プライバシーポリシー"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default PrivacyPage
