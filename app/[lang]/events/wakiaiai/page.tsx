import { SectionAboutWakiaiai } from "app/[lang]/events/wakiaiai/components/SectionAboutWakiaiai"
import type { Metadata } from "next"

const EventWakiaiaiPage = async () => {
  return <SectionAboutWakiaiai />
}

export const metadata: Metadata = {
  title: { absolute: "和気あいAI - 愛知県AIイラスト展示即売会" },
  description:
    "東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会",
  openGraph: {
    title: { absolute: "和気あいAI - 愛知県AIイラスト展示即売会" },
    description:
      "2023年9月30日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
    images: {
      url: "https://www.aipictors.com/wp-content/uploads/2023/07/2NSLUKmgXQni6HaM18FAVTbtd4xscq.webp",
    },
  },
  twitter: {
    title: { absolute: "和気あいAI - 愛知県AIイラスト展示即売会" },
    description:
      "2023年9月30日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
  },
}

export const revalidate = 3600

export default EventWakiaiaiPage
