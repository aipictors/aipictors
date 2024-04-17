import { AlbumCard } from "@/[lang]/(main)/albums/_components/album-card"
import { AppPage } from "@/_components/app/app-page"

/**
 * シリーズの一覧
 * @returns
 */
export default function albums() {
  return (
    <AppPage>
      <div className="flex flex-col">
        <AlbumCard />
      </div>
    </AppPage>
  )
}
