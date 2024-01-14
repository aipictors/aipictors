import { AlbumCard } from "@/app/[lang]/(main)/albums/_components/album-card"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

/**
 * シリーズの一覧
 * @returns
 */
const AlbumsPage = async () => {
  return (
    <AppPage>
      <div className="flex flex-col">
        <AlbumCard />
      </div>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AlbumsPage
