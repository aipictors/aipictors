import { ViewerAlbumArticleHeader } from "@/routes/($lang)._main.my.albums.$album/_components/viewer-album-article-header"
import { ViewerAlbumWorkDescription } from "@/routes/($lang)._main.my.albums.$album/_components/viewer-album-work-description"
import { ViewerAlbumWorkList } from "@/routes/($lang)._main.my.albums.$album/_components/viewer-album-work-list"

export const MyAlbum = () => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        <ViewerAlbumArticleHeader />
        <ViewerAlbumWorkList />
      </div>
      <ViewerAlbumWorkDescription />
    </div>
  )
}
