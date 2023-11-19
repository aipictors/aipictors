import { CollectionList } from "@/app/[lang]/(main)/collections/_components/collection-list"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

const SensitiveCollectionsPage = async () => {
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

export default SensitiveCollectionsPage
