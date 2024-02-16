import { format } from "date-fns"
import { zip } from "fflate"

interface FileObject {
  name: string
  data: Uint8Array
}

export const imageToZip = async (files: FileObject[]): Promise<void> => {
  if (files.length > 0) {
    const zipBlob = await new Promise<Blob>((resolve, reject) => {
      zip(
        Object.fromEntries(files.map((file) => [file.name, file.data])),
        {},
        (err, data) => {
          if (err) reject(err)
          else resolve(new Blob([data], { type: "application/zip" }))
        },
      )
    })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(zipBlob)
    const now = new Date()
    const formattedDate = format(now, "yyyyMMddHHmmss")
    link.download = `images_${formattedDate}.zip`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } else {
    console.error("No valid images found to download.")
  }
}
