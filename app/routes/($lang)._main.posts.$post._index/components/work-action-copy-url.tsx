// copy-work-url.tsx

import { Button } from "~/components/ui/button"
import { RiFileCopyLine } from "@remixicon/react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  currentUrl: string
}

export function CopyWorkUrlButton({ currentUrl }: Props) {
  const t = useTranslation()

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      toast(
        t(
          "URLがクリップボードにコピーされました。",
          "URL has been copied to clipboard.",
        ),
      )
    } catch (err) {
      toast(t("URLのコピーに失敗しました。", "Failed to copy URL."))
      console.error(err)
    }
  }

  return (
    <Button
      className="flex items-center gap-2"
      variant="outline"
      onClick={handleCopyUrl}
    >
      <RiFileCopyLine />
      {t("URLをコピー", "Copy URL")}
    </Button>
  )
}
