import { TagListItem } from "@/[lang]/(main)/tags/_components/tag-list-item"
import { AppPage } from "@/_components/app/app-page"

export default function Tags() {
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
