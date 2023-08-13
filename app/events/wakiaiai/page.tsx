import { Metadata } from "next"
import { FooterHome } from "app/components/FooterHome"
import { SectionAboutWakiaiai } from "app/events/wakiaiai/components/SectionAboutWakiaiai"

const EventWakiaiaiPage = async () => {
  return (
    <>
      <SectionAboutWakiaiai />
      <FooterHome />
    </>
  )
}

export const metadata: Metadata = {
  title: { absolute: "和気あいAI - 展示即売会" },
  description:
    "東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会",
  openGraph: {
    title: { absolute: "和気あいAI - 展示即売会" },
    description:
      "2023年9月30日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
    images: {
      url: "https://www.aipictors.com/wp-content/uploads/2023/07/2NSLUKmgXQni6HaM18FAVTbtd4xscq.webp",
    },
  },
  twitter: {
    title: { absolute: "和気あいAI - 展示即売会" },
    description:
      "2023年9月30日（土）東海地方で初かもしれない、生成AIを利用したイラストの展示やグッズ等の展示即売会！",
  },
}

export const revalidate = 60

export default EventWakiaiaiPage
