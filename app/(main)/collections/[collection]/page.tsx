import type { Metadata } from "next"
import { CollectionArticle } from "app/(main)/collections/[collection]/components/CollectionArticle"
import { MainPage } from "app/components/MainPage"

const CollectionPage = async () => {
  return (
    <MainPage>
      <CollectionArticle />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default CollectionPage
