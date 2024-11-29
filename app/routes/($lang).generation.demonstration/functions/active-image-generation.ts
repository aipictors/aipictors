import { config } from "~/config"

type Props = {
  nanoid: string
}

/**
 * 画像生成機能を有効化する
 */
export async function activeImageGeneration(props: Props) {
  const formData = new FormData()

  formData.append("id", props.nanoid)

  const response = await fetch(config.wordpressEndpoint.www4, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return null
}
