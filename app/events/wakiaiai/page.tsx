import { Metadata } from "next"
import { BoxFooter } from "app/components/BoxFooter"
import { BoxSectionAboutWakiaiai } from "app/events/wakiaiai/components/BoxSectionAboutWakiaiai"

export const revalidate = 60

export const metadata: Metadata = {
  title: "和気あいAI - 展示即売会",
  description:
    "東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会",
  openGraph: {
    title: "和気あいAI - 展示即売会",
    description:
      "2023年9月30日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
    images: {
      url: "https://www.aipictors.com/wp-content/uploads/2023/07/2NSLUKmgXQni6HaM18FAVTbtd4xscq.webp",
    },
  },
}

const EventWakiaiaiPage = async () => {
  return (
    <>
      <BoxSectionAboutWakiaiai />
      <BoxFooter />
    </>
  )
}

export default EventWakiaiaiPage
