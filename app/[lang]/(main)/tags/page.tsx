import { TagListItem } from "@/app/[lang]/(main)/tags/_components/tag-list-item"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

const TagsPage = async () => {
  return (
    <MainPage>
      <article>
        <h1>{"タグ"}</h1>
        <div className="flex flex-col">
          <TagListItem />
        </div>
      </article>
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default TagsPage
