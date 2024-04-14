import { PencilIcon, PlusIcon, ShareIcon } from "lucide-react"

export const ViewerAlbumArticleHeader = () => {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <PencilIcon />
        <ShareIcon>{"Twitterでシェア"}</ShareIcon>
      </div>
      <p className="text-sm"> {"選択後、ドラッグで並び替えできます"}</p>
      <div className="flex">
        <PlusIcon />
      </div>
      <div className="flex" />
    </div>
  )
}
