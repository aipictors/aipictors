"use client"

import { DescriptionSettingDialog } from "@/app/[lang]/(main)/my/albums/[album]/_components/description-setting-dialog"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useDisclosure } from "@chakra-ui/react"
import { Settings } from "lucide-react"

export const ViewerAlbumWorkDescription = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent>
          <div className="flex flex-col">
            <div className="flex">
              <div className="flex">
                <Avatar>
                  <AvatarImage src="https://bit.ly/broken-link" />
                </Avatar>
                <p>{"name"}</p>
              </div>
              <Button onClick={onOpen}>
                <Settings />
              </Button>
            </div>
            <div className="flex" />
            <p>{"説明"}</p>
          </div>
        </CardContent>
      </Card>
      <DescriptionSettingDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
