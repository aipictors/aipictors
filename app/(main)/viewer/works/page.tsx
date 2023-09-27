import type { Metadata } from "next"
import { ViewerWorksHome } from "app/(main)/viewer/works/components/ViewerWorksHome"
import { MainPage } from "app/components/MainPage"

const ViewerWorksPage = async () => {
  return (
    <MainPage>
      <ViewerWorksHome />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default ViewerWorksPage
