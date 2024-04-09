import { RankingHeader } from "@/[lang]/(main)/awards/_components/ranking-header"
import { AppPage } from "@/_components/app/app-page"

export default function SensitiveMonthAward() {
  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1
  /**
   * 月ごとのアワード
   */
  return (
    <AppPage>
      <RankingHeader year={year} month={month} day={1} />
    </AppPage>
  )
}
