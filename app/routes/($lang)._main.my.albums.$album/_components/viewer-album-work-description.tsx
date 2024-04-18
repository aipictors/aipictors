import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"
import { Button } from "@/_components/ui/button"
import { Card, CardContent } from "@/_components/ui/card"
import { DescriptionSettingDialog } from "@/routes/($lang)._main.my.albums.$album/_components/description-setting-dialog"
import { SettingsIcon } from "lucide-react"
import { useBoolean } from "usehooks-ts"

export const ViewerAlbumWorkDescription = () => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent>
          <div className="flex flex-col">
            <div className="flex">
              <div className="flex">
                <Avatar>
                  <AvatarImage src="https://bit.ly/broken-link" />
                  <AvatarFallback />
                </Avatar>
                <p>{"name"}</p>
              </div>
              <Button onClick={onOpen}>
                <SettingsIcon />
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
