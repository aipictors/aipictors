"use client"

import { InPaintingSetting } from "@/app/[lang]/(beta)/generation/_components/in-painting-setting"
import { fetchImage } from "@/app/_utils/fetch-image-object-url"
import { uploadImage } from "@/app/_utils/upload-image"
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
import { getAuth, getIdToken } from "firebase/auth"
import dynamic from "next/dynamic"
import { useState } from "react"

type Props = {
  isOpen: boolean
  onClose(): void
  taskId: string
  token: string
}

export const getRandomStr = (count: number) => {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789"
  let result = ""
  const charactersLength = characters.length
  for (let i = 0; i < count; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const InPaintingImageDialog = (props: Props) => {
  if (props.taskId === "" || props.token === "") return null
  const { data } = useSuspenseQuery({
    queryKey: [props.taskId],
    queryFn() {
      return fetchImage(Config.wordpressPrivateImageEndpoint, props.token)
    },
  })
  const [paintImageBase64, setPaintImageBase64] = useState("")
  const onChangePaint = (imageBase64: string) => {
    setPaintImageBase64(imageBase64)
  }

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
          <InPaintingEditImage
            onChange={(imageBase64: string) => onChangePaint(imageBase64)}
            imageUrl={data}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              // TODO: ファイルアップロードがうまくいかないので修正する
              // ※ サーバ側でtokenからユーザIDを復元できない
              const currentUser = getAuth().currentUser
              if (!currentUser) return
              const token = await getIdToken(currentUser, true)
              const fileName = getRandomStr(30) + "_inpaint_mask_src.png"
              try {
                await uploadImage(paintImageBase64, fileName, token)
              } catch (error) {
                console.log(error)
              }
              console.log(paintImageBase64) // ペイント軌跡の色を反転して背景を黒く染めた画像(マスク用)
              console.log(fileName)
              console.log(token)

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
