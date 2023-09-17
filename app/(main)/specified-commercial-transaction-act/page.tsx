import type { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const SctaPage = async () => {
  return <PagePlaceholder>{"特定商取引法に基づく表記"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SctaPage
