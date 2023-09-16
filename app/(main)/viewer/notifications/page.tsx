import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const ViewerNotificationsPage = async () => {
  return <PagePlaceholder>{"通知"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerNotificationsPage
