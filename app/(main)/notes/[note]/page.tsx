import type { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const NotePage = async () => {
  return <PagePlaceholder>{"コラムの詳細"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default NotePage
