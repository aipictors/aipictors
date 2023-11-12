import { ViewerWorkTable } from "@/app/[lang]/(main)/my/works/_components/viewer-work-table"
import { MainPage } from "@/app/_components/page/main-page"
import type { Metadata } from "next"

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
