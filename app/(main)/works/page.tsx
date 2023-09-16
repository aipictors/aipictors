import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const WorksPage = async () => {
  return <PagePlaceholder>{"作品の一覧"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default WorksPage
