import { AppPage } from "@/_components/app/app-page"
import { TagListItem } from "@/routes/($lang)._main.tags._index/_components/tag-list-item"

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
