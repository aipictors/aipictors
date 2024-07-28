import { AppPage } from "~/components/app/app-page"
import { CollectionList } from "~/routes/($lang)._main.collections._index/components/collection-list"

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
