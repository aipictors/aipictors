import { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const AppPage = async () => {
  return <PagePlaceholder>{"アプリの案内"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AppPage
