import { AppPage } from "@/_components/app/app-page"
import { CollectionList } from "@/routes/($lang)._main.collections._index/_components/collection-list"

/**
 * コレクションの一覧
 */
export default function Collections() {
  return (
    <AppPage>
      <CollectionList />
    </AppPage>
  )
}
