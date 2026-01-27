import { createImageFileFromUrl } from "~/routes/($lang).generation._index/utils/create-image-file-from-url"

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_")
}

export const downloadImageFileAsPng = async (
  fileNameBase: string,
  imageUrl: string,
): Promise<void> => {
  if (!imageUrl) {
    console.error("画像が存在しません")
    return
  }

  const safeBaseName = sanitizeFileName(fileNameBase || "file")

  try {
    const file = await createImageFileFromUrl({
      url: imageUrl,
      name: safeBaseName,
      extension: "png",
    })

    const blob = new Blob([file.data], { type: "image/png" })

    const linkNode = document.createElement("a")
    linkNode.href = URL.createObjectURL(blob)
    linkNode.download = file.name
    linkNode.rel = "noopener"

    document.body.appendChild(linkNode)
    linkNode.click()
    document.body.removeChild(linkNode)

    URL.revokeObjectURL(linkNode.href)
  } catch (error) {
    console.error(error)
  }
}
