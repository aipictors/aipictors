import type { Metadata } from "next"
import { ViewerWorkList } from "app/(main)/viewer/works/components/ViewerWorkList"
import { MainPage } from "app/components/MainPage"

const ViewerWorksPage = async () => {
  return (
    <MainPage>
      <ViewerWorkList />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerWorksPage
