"use client"

import { InPaintingEditImage } from "@/app/[lang]/(beta)/generation/_components/in-painting-edit-image"
import { InPaintingSetting } from "@/app/[lang]/(beta)/generation/_components/in-painting-setting"
import { fetchImage } from "@/app/_utils/fetch-image-object-url"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Config } from "@/config"
import { useSuspenseQuery } from "@tanstack/react-query"

type Props = {
  isOpen: boolean
  onClose(): void
  taskId: string
  token: string
}

export const InPaintingImageDialog = (props: Props) => {
  if (props.taskId === "" || props.token === "") return null
  const { data } = useSuspenseQuery({
    queryKey: [props.taskId],
    queryFn() {
      return fetchImage(Config.wordpressPrivateImageEndpoint, props.token)
    },
  })

  return (
    <Dialog onOpenChange={props.onClose} open={props.isOpen}>
      <DialogContent>
        <DialogHeader />
        <div className="flex flex-col">
          <div>
            <p className="text-lg">{"一部修正"}</p>
            <p className="text-md">
              {
                "画像の修正したい箇所を塗潰して置き換えたい内容のキーワードを入力してください"
              }
            </p>
          </div>
          <div>
            <div className="flex">
              <p>{"修正内容のキーワード（英単語）:"}</p>
            </div>
            <Input placeholder="一部修正" />
          </div>
          <InPaintingSetting />
          <InPaintingEditImage imageUrl={data} />
        </div>
        <DialogFooter>
          <Button
            // colorScheme="primary"
            onClick={() => {
              props.onClose()
            }}
          >
            {"修正する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
