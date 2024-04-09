import { ViewerAlbumHeader } from "@/[lang]/(main)/my/albums/_components/viewer-album-header"
import { AppPage } from "@/_components/app/app-page"
import type { Metadata } from "next"

export default function MyAlbum() {
  return (
    <AppPage>
      <ViewerAlbumHeader />
    </AppPage>
  )
}
