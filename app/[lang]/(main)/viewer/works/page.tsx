import type { Metadata } from "next"
import { ViewerWorkTable } from "app/[lang]/(main)/viewer/works/components/ViewerWorkTable"
import { MainPage } from "app/components/MainPage"

const ViewerWorksPage = async () => {
  return (
    <MainPage>
      <ViewerWorkTable />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerWorksPage
