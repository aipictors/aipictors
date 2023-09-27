import type { Metadata } from "next"
import { CollectionList } from "app/(main)/collections/components/CollectionList"
import { CollectionListItem } from "app/(main)/collections/components/CollectionListItem"
import { MainPage } from "app/components/MainPage"

const CollectionsPage = async () => {
  return (
    <MainPage>
      <CollectionList />
      <CollectionListItem />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default CollectionsPage
