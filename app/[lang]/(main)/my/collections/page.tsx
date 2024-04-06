import { ViewerCollectionList } from "@/[lang]/(main)/my/collections/_components/viewer-collection-list"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

const MyCollectionsPage = async () => {
  return (
    <AppPage>
      <ViewerCollectionList />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default MyCollectionsPage
