import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const ViewerWorksPage = async () => {
  return <PagePlaceholder>{"作品"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerWorksPage
