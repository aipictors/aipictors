import { PlaceholderPage } from "@/app/_components/page/placeholder-page"
import type { Metadata } from "next"

const RankingPage = async () => {
  return <PlaceholderPage>{"センシティブ"}</PlaceholderPage>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default RankingPage
