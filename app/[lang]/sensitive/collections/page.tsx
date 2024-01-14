import { CollectionList } from "@/app/[lang]/(main)/collections/_components/collection-list"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

const SensitiveCollectionsPage = async () => {
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

export const revalidate = 60

export default SensitiveCollectionsPage
