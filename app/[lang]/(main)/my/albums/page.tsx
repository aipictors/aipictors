import { ViewerAlbumHeader } from "@/app/[lang]/(main)/my/albums/_components/viewer-album-header"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

const MyAlbumsPage = async () => {
  return (
    <AppPage>
      <ViewerAlbumHeader />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default MyAlbumsPage
