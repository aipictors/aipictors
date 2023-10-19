import { CollectionList } from "app/[lang]/(main)/collections/_components/CollectionList"
import { MainPage } from "app/_components/MainPage"
import type { Metadata } from "next"

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
