import { Metadata } from "next"
import { PagePlaceholder } from "components/PagePlaceholder"

const RankingPage = async () => {
  return <PagePlaceholder>{"ランキング"}</PagePlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default RankingPage
