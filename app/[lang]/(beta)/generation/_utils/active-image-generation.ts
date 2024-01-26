import { Config } from "@/config"

type Props = {
  nanoid: string
}

export async function activeImageGeneration(props: Props) {
  const formData = new FormData()

  formData.append("id", props.nanoid)

  const response = await fetch(Config.wordpressWWW4Endpoint, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return null
}
