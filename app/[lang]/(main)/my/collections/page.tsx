import { ViewerCollectionList } from "@/app/[lang]/(main)/my/collections/_components/viewer-collection-list"
import { AppPage } from "@/components/app/app-page"
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

export const revalidate = 60

export default MyCollectionsPage
