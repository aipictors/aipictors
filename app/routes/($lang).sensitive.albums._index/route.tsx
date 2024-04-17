import { AlbumCard } from "@/[lang]/(main)/albums/_components/album-card"
import { AppPage } from "@/_components/app/app-page"

export default function SensitiveAlbumsPage() {
  return (
    <AppPage>
      <div className="flex flex-col">
        <AlbumCard />
      </div>
    </AppPage>
  )
}
