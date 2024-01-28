"use client"

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
import { Separator } from "@/components/ui/separator"
import { Config } from "@/config"
import { useSuspenseQuery } from "@tanstack/react-query"
import dynamic from "next/dynamic"

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
            <Input placeholder="修正内容のキーワード（英単語）" />
          </div>
          <div className="py-2">
            <Separator />
          </div>
          <InPaintingSetting />
          <div className="py-2">
            <Separator />
          </div>
          <InPaintingEditImage imageUrl={data} />
        </div>
        <DialogFooter>
          <Button
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

const InPaintingEditImage = dynamic(
  () => {
    return import(
      "@/app/[lang]/(beta)/generation/_components/in-painting-edit-image"
    )
  },
  { ssr: false },
)
