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
import dynamic from "next/dynamic"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  isOpen: boolean
  onClose(): void
  taskId: string
  token: string
  userNanoid: string | null
}

/**
 * ランダムな文字列を取得
 * @param count
 * @returns
 */
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

export const getBase64FromImageUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.setAttribute("crossOrigin", "anonymous")
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL("image/png")
        resolve(dataURL)
      } else {
        reject("ctx is null")
      }
    }
    img.src = url
  })
}

export const requestInpaintGenerationTask = async (
  userNanoid: string,
  paintMaskImageBase64: string,
  paintImageBase64: string,
) => {
  return new Promise(async (resolve, reject) => {
    if (!userNanoid) {
      toast("ログインしてから実行してください")
      return
    }
    const fileMaskName = getRandomStr(30) + "_inpaint_mask_src.png"
    try {
      const fileMaskPath = await uploadImage(
        paintMaskImageBase64,
        fileMaskName,
        userNanoid,
      )
      if (fileMaskPath != "") {
        const fileSrcName = getRandomStr(30) + "_img2img_src.png"
        const fileSrcPath = await uploadImage(
          paintImageBase64,
          fileSrcName,
          userNanoid,
        )
        if (fileSrcPath != "") {
          // ここでリクエストする
          console.log(fileMaskPath)
          console.log(fileSrcPath)
        }
      }
    } catch (error) {
      console.log(error)
    }
  })
}

/**
 * インペイント用のダイアログ
 * @param count
 * @returns
 */
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

  const [isLoading, setIsLoading] = useState(true)

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
            onLoaded={() => setIsLoading(false)}
            isLoading={isLoading}
            onChange={(imageBase64: string) => onChangePaint(imageBase64)}
            imageUrl={data}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading}
            onClick={async () => {
              if (props.userNanoid === null) {
                toast("ログインしてから実行してください")
                return
              }
              const srcImageBase64 = await getBase64FromImageUrl(data)
              if (srcImageBase64 === "") return
              props.onClose()
              await requestInpaintGenerationTask(
                props.userNanoid,
                srcImageBase64,
                paintImageBase64,
              )
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
