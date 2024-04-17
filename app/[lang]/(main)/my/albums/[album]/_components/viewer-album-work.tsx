import { AlbumWorkDeleteDialog } from "@/[lang]/(main)/my/albums/[album]/_components/album-work-delete-dialog"
import { Button } from "@/_components/ui/button"
import { Card, CardContent } from "@/_components/ui/card"
import { Trash2Icon } from "lucide-react"
import { useBoolean } from "usehooks-ts"

export const ViewerAlbumWork = () => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  return (
    <>
      <Card className="overflow-hidden">
        <Button className="overflow-hidden">
          <CardContent>
            <div className="flex">
              <p>{"タイトル"}</p>
              <Button onClick={onOpen}>
                <Trash2Icon />
              </Button>
            </div>
            <div className="flex">
              <img src="https://bit.ly/dan-abramov" alt="Dan" />
              <div className="flex flex-col">
                <p>{"いいね数："}</p>
                <p>{"閲覧数："}</p>
                <p className="whitespace-pre-wrap">{"使用AI："}</p>
                <p className="whitespace-pre-wrap">{"投稿時間："}</p>
              </div>
            </div>
          </CardContent>
        </Button>
      </Card>
      <AlbumWorkDeleteDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
