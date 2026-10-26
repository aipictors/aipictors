import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { uploadPublicImage } from "~/utils/upload-public-image"

/**
 * 画像ファイルを最大辺 maxSize の webp に縮小して base64 にする
 */
export const fileToResizedDataUrl = (
  file: File,
  maxSize = 1280,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      const context = canvas.getContext("2d")
      URL.revokeObjectURL(url)
      if (!context) {
        reject(new Error("画像を読み込めませんでした"))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/webp", 0.9))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("画像を読み込めませんでした"))
    }
    image.src = url
  })
}

/**
 * サムネイル・サンプル画像を既存の画像アップローダーへ送る
 */
export function useModelImageUploader() {
  const authContext = useContext(AuthContext)
  const { data } = useQuery(userModelViewerTokenQuery, {
    skip: !authContext.isLoggedIn,
    fetchPolicy: "cache-first",
  })

  const upload = async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("画像ファイルを選択してください")
    }
    const dataUrl = await fileToResizedDataUrl(file)
    return uploadPublicImage(dataUrl, data?.viewer?.token)
  }

  return { upload, isReady: Boolean(data?.viewer?.token) }
}

const userModelViewerTokenQuery = graphql(
  `query UserModelViewerToken {
    viewer {
      id
      token
    }
  }`,
)
