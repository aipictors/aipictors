import { RiStickyNoteLine } from "@remixicon/react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  url: string
}

/**
 * note の投稿画面を開いて、本文に作品の URL（カード表示になる）を入れる
 */
export function NoteIntent(props: Props) {
  const t = useTranslation()

  const intentUrl = new URL("https://note.com/intent/post")
  intentUrl.searchParams.set("url", props.url)

  return (
    <Button className="flex items-center gap-2" variant="outline" asChild>
      <a href={intentUrl.toString()} target="_blank" rel="noopener noreferrer">
        <RiStickyNoteLine />
        {t("noteで共有する", "Share on note")}
      </a>
    </Button>
  )
}
