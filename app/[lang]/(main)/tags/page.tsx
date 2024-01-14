import { TagListItem } from "@/app/[lang]/(main)/tags/_components/tag-list-item"
import { AppPage } from "@/components/app/app-page"
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

export const revalidate = 60

export default TagsPage
