import { ViewerCollectionList } from "app/[lang]/(main)/viewer/collections/_components/ViewerCollectionList"
import { MainPage } from "app/_components/MainPage"
import type { Metadata } from "next"

const ViewerCollectionsPage = async () => {
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

export default ViewerCollectionsPage
