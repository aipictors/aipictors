import { Button } from "@/components/ui/button"
import { ArrowDownToLine } from "lucide-react"
import React, { useState } from "react"
import { imageToZip } from "../_utils/image-to-zip"

interface FileObject {
  name: string
  data: Uint8Array
}

const GenerationHistoryDownloadWithZip: React.FC<{
  disabled: boolean
  selectedTaskIds: string[]
}> = ({ disabled, selectedTaskIds }) => {
  const [isPreparingDownload, setIsPreparingDownload] = useState(false)

  const handleDownloadZip = async () => {
    setIsPreparingDownload(true)
    const files: FileObject[] = []

    for (const taskId of selectedTaskIds) {
      const imageElement = document.querySelector(
        `.generation-image-${taskId}`,
      ) as HTMLImageElement
      if (!imageElement) {
        console.error(`Image element not found for taskId: ${taskId}`)
        continue
      }
      const response = await fetch(imageElement.src)
      if (!response.ok) {
        console.error(`Failed to fetch image: ${imageElement.src}`)
        continue
      }
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      files.push({ name: `${taskId}.png`, data: new Uint8Array(arrayBuffer) })
    }

    // ここでImageToZip関数を呼び出して、ファイルをzipにしてダウンロード
    await imageToZip(files)

    setIsPreparingDownload(false)
  }

  return (
    <Button
      disabled={disabled || isPreparingDownload}
      variant="ghost"
      size="icon"
      onClick={handleDownloadZip}
    >
      {isPreparingDownload ? (
        "Preparing..."
      ) : (
        <ArrowDownToLine className="w-4" />
      )}
    </Button>
  )
}

export default GenerationHistoryDownloadWithZip
