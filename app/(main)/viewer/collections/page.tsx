import type { Metadata } from "next"
import { ViewerCollectionListItem } from "app/(main)/viewer/collections/components/ViewerCollectionListItem"
import { MainPage } from "app/components/MainPage"

const ViewerCollectionsPage = async () => {
  return (
    <MainPage>
      <ViewerCollectionListItem />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerCollectionsPage
