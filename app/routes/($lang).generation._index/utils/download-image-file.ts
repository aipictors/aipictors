import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"

type Options = {
  skipGenerativeNormalization?: boolean
}

export const downloadImageFile = async (
  _fileName: string,
  imageUrl: string,
  options?: Options,
): Promise<void> => {
  if (!imageUrl) {
    console.error("画像が存在しません")
    return
  }

  try {
    const downloadUrl = getDownloadProxyUrl(imageUrl, options)

    // Let the proxy set Content-Disposition (timestamp naming). Using an <a> click keeps it
    // closer to a user gesture and avoids buffering large blobs in memory.
    const linkNode = document.createElement("a")
    linkNode.href = downloadUrl
    linkNode.download = ""
    linkNode.rel = "noopener"

    document.body.appendChild(linkNode)
    linkNode.click()
    document.body.removeChild(linkNode)
  } catch (error) {
    console.error(error)
    // 必要に応じてUI上のエラーメッセージ表示
  }
}
