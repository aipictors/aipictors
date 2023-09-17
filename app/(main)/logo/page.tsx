import { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const LogoPage = async () => {
  return <PagePlaceholder>{"ロゴ"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default LogoPage
