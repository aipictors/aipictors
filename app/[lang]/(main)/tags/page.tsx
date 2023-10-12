import type { Metadata } from "next"
import { TagList } from "app/[lang]/(main)/tags/components/TagList"
import { MainPage } from "app/components/MainPage"

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
