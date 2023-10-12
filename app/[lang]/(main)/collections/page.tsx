import type { Metadata } from "next"
import { CollectionList } from "app/[lang]/(main)/collections/components/CollectionList"
import { MainPage } from "app/components/MainPage"

const CollectionsPage = async () => {
  return (
    <MainPage>
      <CollectionList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default CollectionsPage
