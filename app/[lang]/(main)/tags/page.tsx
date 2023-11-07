import { TagList } from "app/[lang]/(main)/tags/_components/TagList"
import { MainPage } from "app/_components/page/MainPage"
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
