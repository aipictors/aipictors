import { ViewerCollectionList } from "app/[lang]/(main)/my/collections/_components/viewer-collection-list"
import { MainPage } from "app/_components/page/main-page"
import type { Metadata } from "next"

const MyCollectionsPage = async () => {
  return (
    <MainPage>
      <ViewerCollectionList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MyCollectionsPage
