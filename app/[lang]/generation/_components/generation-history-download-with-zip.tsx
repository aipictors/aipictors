import { fetchImage } from "@/app/_utils/fetch-image-object-url"
import { Button } from "@/components/ui/button"
import * as fflate from "fflate"
import { ArrowDownToLine } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface GenerationHistoryDownloadWithZipProps {
  disabled?: boolean
  selectedTaskIds: string[]
  token: string // Token is now required to fetch images
}

const GenerationHistoryDownloadWithZip = ({
  disabled = false,
  selectedTaskIds,
  token,
}: GenerationHistoryDownloadWithZipProps) => {
  const [isPreparingDownload, setIsPreparingDownload] = useState(false)

  const handleDownloadZip = async () => {
    setIsPreparingDownload(true)
    const files: { [key: string]: Uint8Array } = {}

    try {
      // Promise.allを使用して全ての画像のfetchが完了するのを待つ
      await Promise.all(
        selectedTaskIds.map(async (taskId) => {
          const imageUrl = await fetchImage(taskId, token)
          console.log({ imageUrl })
          const response = await fetch(imageUrl)
          if (!response.ok)
            throw new Error(`Image fetch failed: ${response.statusText}`)
          const arrayBuffer = await response.arrayBuffer()
          files[`${taskId}.png`] = new Uint8Array(arrayBuffer)
        }),
      )

      if (Object.keys(files).length === 0) {
        toast("ダウンロードする画像がありません。")
        setIsPreparingDownload(false)
        return
      }

      // 全ての画像がfetchされた後にZIP圧縮を行う
      fflate.zip(files, (err, zip) => {
        setIsPreparingDownload(false)
        if (err) {
          toast("Zip圧縮中にエラーが発生しました")
          console.error(err)
          return
        }

        toast("Zip圧縮に成功しました。ダウンロードを開始します。")
        const blob = new Blob([zip], { type: "application/zip" })

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "images.zip"
        document.body.appendChild(a)
        a.click()

        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.error("Error processing images for download:", error)
      toast("画像データの取得中にエラーが発生しました")
      setIsPreparingDownload(false)
    }
  }

  useEffect(() => {
    // Cleanup function in case component unmounts during download preparation
    return () => {
      setIsPreparingDownload(false)
    }
  }, [])

  return (
    <Button
      disabled={disabled || isPreparingDownload}
      variant="ghost"
      size="icon"
      onClick={handleDownloadZip}
    >
      <ArrowDownToLine className="w-4" />
    </Button>
  )
}

export default GenerationHistoryDownloadWithZip
