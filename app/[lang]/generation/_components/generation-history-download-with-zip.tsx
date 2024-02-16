import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { zip } from "fflate"
import { ArrowDownToLine } from "lucide-react"
import { useState } from "react"

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

    if (files.length > 0) {
      const zipBlob = await new Promise<Blob>((resolve, reject) => {
        zip(
          Object.fromEntries(files.map((file) => [file.name, file.data])),
          {},
          (err, data) => {
            if (err) {
              reject(err)
            } else {
              resolve(new Blob([data], { type: "application/zip" }))
            }
          },
        )
      })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(zipBlob)
      const now = new Date()
      const formattedDate = format(now, "yyyyMMddHHmmss")
      link.download = `images_${formattedDate}.zip`

      document.body.appendChild(link) // Ensure visibility for certain browsers
      link.click()
      document.body.removeChild(link) // Clean up
      URL.revokeObjectURL(link.href) // Free up resources
    } else {
      console.error("No valid images found to download.")
    }

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
