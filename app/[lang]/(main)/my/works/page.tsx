import { ViewerWorkTable } from "@/app/[lang]/(main)/my/works/_components/viewer-work-table"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

const ViewerWorksPage = async () => {
  return (
    <AppPage>
      <ViewerWorkTable />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export default ViewerWorksPage
