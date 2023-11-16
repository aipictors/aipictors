"use client"

import { AlbumWorkDeleteDialog } from "@/app/[lang]/(main)/my/albums/[album]/_components/album-work-delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useDisclosure } from "@chakra-ui/react"
import { Trash2 } from "lucide-react"

export const ViewerAlbumWork = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Card className="overflow-hidden">
        <Button className="overflow-hidden">
          <CardContent>
            <div className="flex">
              <p>{"タイトル"}</p>
              <Button onClick={onOpen}>
                <Trash2 />
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
