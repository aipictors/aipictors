// copy-work-url.tsx

import { RiCheckLine, RiFileCopyLine } from "@remixicon/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  currentUrl: string
}

export function CopyWorkUrlButton({ currentUrl }: Props) {
  const t = useTranslation()
  const [isCopied, setIsCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setIsCopied(true)

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }

      timerRef.current = window.setTimeout(() => {
        setIsCopied(false)
      }, 1500)

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
      aria-live="polite"
    >
      {isCopied ? <RiCheckLine /> : <RiFileCopyLine />}
      {isCopied ? t("コピーしました", "Copied") : t("URLをコピー", "Copy URL")}
    </Button>
  )
}
