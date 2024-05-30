import {} from "@/_components/ui/table"
import { PlusIcon } from "lucide-react"
import { Suspense, useContext, useState } from "react"
import { Dialog, DialogTrigger, DialogContent } from "@/_components/ui/dialog"
import { getBase64FromImageUrl } from "@/_utils/get-base64-from-image-url"
import { CropImageField } from "@/_components/crop-image-field"
import { Input } from "@/_components/ui/input"
import { AutoResizeTextarea } from "@/_components/auto-resize-textarea"
import { Button } from "@/_components/ui/button"
import { SelectCreatedWorksDialog } from "@/routes/($lang).dashboard._index/_components/select-created-works-dialog"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import type { WorksQuery } from "@/_graphql/__generated__/graphql"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { AuthContext } from "@/_contexts/auth-context"

type Props = {
  children: React.ReactNode
}

/**
 * シリーズ一覧テーブルの項目
 */
export const CreateAlbumDialog = (props: Props) => {
  const appContext = useContext(AuthContext)

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string>("")

  const [title, setTitle] = useState<string>("")

  const [slug, setSlug] = useState<string>("")

  const [description, setDescription] = useState<string>("")

  const [selectedWorks, setSelectedWorks] = useState<WorksQuery["works"]>([])

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, "") // Remove non-alphanumeric characters
    setSlug(alphanumericValue)
  }

  /**
   * クロップ完了
   * @param croppedImage クロップした画像
   */
  const onCrop = async (croppedImage: string) => {
    const base64 = await getBase64FromImageUrl(croppedImage)
    setThumbnailImageUrl(base64)
  }

  const onReset = () => {
    setThumbnailImageUrl("")
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(isOpen) => {
          setIsOpen((prev) => (prev !== isOpen ? isOpen : prev))
        }}
      >
        <DialogTrigger asChild>{props.children}</DialogTrigger>
        <DialogContent>
          {"シリーズ追加"}
          <ScrollArea className="overflow-y-auto">
            <div className="max-h-[80vh] space-y-4 md:max-h-[100%]">
              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">カバー</p>
                </div>
                <CropImageField
                  isHidePreviewImage={false}
                  cropWidth={1200}
                  cropHeight={627}
                  onDeleteImage={onReset}
                  onCrop={onCrop}
                />
                <p className="text-sm">
                  カバーにはR18部分を含まないようにしてください。
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">タイトル</p>
                  <p className="text-sm opacity-50">*必須</p>
                </div>
                <Input
                  placeholder="シリーズの名前"
                  value={title}
                  type={"text"}
                  onChange={(event) => {
                    setTitle(event.target.value)
                  }}
                  maxLength={32}
                />
              </div>
              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">リンク名(英数字のみ)</p>
                  <p className="text-sm opacity-50">*必須</p>
                </div>
                <Input
                  placeholder="URLに使用されるリンク名(/series/●●)"
                  value={slug}
                  type="text"
                  onChange={handleSlugChange}
                  maxLength={32}
                />
                <p className="text-sm opacity-80">
                  {`https://beta.aipictors.com/${appContext.userId}/series/${slug}`}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">説明</p>
                  <p className="text-sm opacity-50">*必須</p>
                </div>
                <AutoResizeTextarea
                  placeholder="シリーズの説明"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value)
                  }}
                  maxLength={160}
                />
              </div>
              <div className="space-y-1">
                <div className="flex space-x-2">
                  <p className="font-bold text-sm">作品</p>
                  <p className="text-sm opacity-50">*必須</p>
                </div>
                <Suspense fallback={<AppLoadingPage />}>
                  <SelectCreatedWorksDialog
                    selectedWorks={selectedWorks}
                    setSelectedWorks={setSelectedWorks}
                  >
                    <div className="border-2 border-transparent p-1">
                      <Button
                        className="h-16 w-16"
                        size={"icon"}
                        variant={"secondary"}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </SelectCreatedWorksDialog>
                </Suspense>
              </div>
            </div>
          </ScrollArea>
          <Button onClick={() => {}}>保存して追加</Button>
          <Button
            variant={"secondary"}
            onClick={() => {
              setIsOpen(false)
            }}
          >
            キャンセル
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
