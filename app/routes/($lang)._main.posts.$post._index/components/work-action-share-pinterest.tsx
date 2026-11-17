import { RiPinterestLine } from "@remixicon/react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  url: string
  imageUrl?: string
  description: string
}

/**
 * Pinterest のピン作成画面を開く（画像を渡すとその画像でピンになる）
 */
export function PinterestIntent(props: Props) {
  const t = useTranslation()

  const intentUrl = new URL("https://www.pinterest.com/pin/create/button/")
  intentUrl.searchParams.set("url", props.url)
  if (props.imageUrl) intentUrl.searchParams.set("media", props.imageUrl)
  intentUrl.searchParams.set("description", props.description)

  return (
    <Button className="flex items-center gap-2" variant="outline" asChild>
      <a href={intentUrl.toString()} target="_blank" rel="noopener noreferrer">
        <RiPinterestLine />
        {t("Pinterestに保存する", "Save to Pinterest")}
      </a>
    </Button>
  )
}
