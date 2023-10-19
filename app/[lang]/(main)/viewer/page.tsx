import { PlaceholderPage } from "app/_components/Placeholder"
import type { Metadata } from "next"

const ViewerPage = async () => {
  return <PlaceholderPage>{"ダッシュボード"}</PlaceholderPage>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerPage
