import { Metadata } from "next"
import { PagePlaceholder } from "app/components/PagePlaceholder"

const RankingPage = async () => {
  return <PagePlaceholder>{"ランキング（センシティブ）"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default RankingPage
