import { ViewerCollectionList } from "app/[lang]/(main)/my/collections/_components/ViewerCollectionList"
import { MainPage } from "app/_components/page/MainPage"
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
