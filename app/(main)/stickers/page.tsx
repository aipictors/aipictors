import type { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

/**
 * https://www.aipictors.com/stamp-space/
 * @returns
 */
const StickersPage = async () => {
  return <PagePlaceholder>{"スタンプ広場"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default StickersPage
