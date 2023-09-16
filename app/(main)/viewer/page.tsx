import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const ViewerPage = async () => {
  return <PagePlaceholder>{"ダッシュボード"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerPage
