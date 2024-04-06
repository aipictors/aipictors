import { CollectionList } from "@/[lang]/(main)/collections/_components/collection-list"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

/**
 * コレクションの一覧
 * @returns
 */
const CollectionsPage = async () => {
  return (
    <AppPage>
      <CollectionList />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default CollectionsPage
