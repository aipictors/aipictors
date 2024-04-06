import { TagListItem } from "@/[lang]/(main)/tags/_components/tag-list-item"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

const TagsPage = async () => {
  return (
    <AppPage>
      <article>
        <h1>{"タグ"}</h1>
        <div className="flex flex-col">
          <TagListItem />
        </div>
      </article>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default TagsPage
