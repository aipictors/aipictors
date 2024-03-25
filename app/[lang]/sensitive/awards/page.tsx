import { RankingHeader } from "@/app/[lang]/(main)/awards/_components/ranking-header"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

const SensitiveAwardsPage = async () => {
  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1

  const day = new Date().getDate()

  return (
    <AppPage>
      <RankingHeader year={year} month={month} day={day} />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default SensitiveAwardsPage
