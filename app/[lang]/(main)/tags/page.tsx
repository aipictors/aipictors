import { TagList } from "@/app/[lang]/(main)/tags/_components/tag-list"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

const TagsPage = async () => {
  return (
    <MainPage>
      <TagList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default TagsPage
