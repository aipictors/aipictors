import type { Metadata } from "next"
import { PlaceholderPage } from "app/components/Placeholder"

const WorksPage = async () => {
  return <PlaceholderPage>{"作品の一覧"}</PlaceholderPage>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default WorksPage
