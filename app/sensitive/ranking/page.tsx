import type { Metadata } from "next"
import { MainRanking } from "app/(main)/ranking/components/MainRanking"

const SensitiveRankingPage = async () => {
  return <MainRanking />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveRankingPage
