import { useQueryClient } from "@tanstack/react-query"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { userModelsQueryKeys } from "~/components/user-models/use-user-models"
import { UserModelMetadataFields } from "~/components/user-models/user-model-metadata-fields"
import { updateUserModel } from "~/lib/user-models/client"
import type {
  UserModel,
  UserModelEditableFields,
} from "~/lib/user-models/types"

type Props = {
  model: UserModel
  isOpen: boolean
  onOpenChange(isOpen: boolean): void
  onUpdated?(model: UserModel): void
}

const toEditable = (model: UserModel): UserModelEditableFields => ({
  name: model.name,
  description: model.description,
  triggerWords: model.triggerWords,
  recommendedWeight: model.recommendedWeight,
  baseModel: model.baseModel,
  rating: model.rating,
  tags: model.tags,
  thumbnailUrl: model.thumbnailUrl,
  sampleImageUrls: model.sampleImageUrls,
})

/**
 * モデル情報の編集（作者のみ）
 */
export function UserModelEditDialog(props: Props) {
  const queryClient = useQueryClient()
  const [value, setValue] = useState<UserModelEditableFields>(() =>
    toEditable(props.model),
  )
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const onSave = async () => {
    if (value.name.trim() === "") {
      toast("名前を入力してください")
      return
    }
    setIsSaving(true)
    try {
      const updated = await updateUserModel(props.model.id, {
        ...value,
        name: value.name.trim(),
      })
      queryClient.setQueryData(
        userModelsQueryKeys.detail(props.model.id),
        updated,
      )
      queryClient.invalidateQueries({ queryKey: userModelsQueryKeys.all })
      props.onUpdated?.(updated)
      toast("モデル情報を更新しました")
      props.onOpenChange(false)
    } catch (error) {
      toast(error instanceof Error ? error.message : "更新に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      open={props.isOpen}
      onOpenChange={(isOpen) => {
        if (isOpen) setValue(toEditable(props.model))
        props.onOpenChange(isOpen)
      }}
    >
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-5">
          <DialogTitle>モデル情報を編集</DialogTitle>
          <DialogDescription>
            ファイル以外の情報はいつでも変更できます
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-5">
            <UserModelMetadataFields
              kind={props.model.kind}
              value={value}
              onChange={setValue}
              onUploadingChange={setIsUploadingImage}
            />
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2 border-t p-4">
          <Button variant="ghost" onClick={() => props.onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={onSave} disabled={isSaving || isUploadingImage}>
            {isSaving && <Loader2Icon className="mr-1.5 size-4 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
