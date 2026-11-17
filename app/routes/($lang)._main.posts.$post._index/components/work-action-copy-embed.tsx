import { RiCheckLine, RiCodeSSlashLine } from "@remixicon/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { createEmbedCode } from "~/lib/work-embed"

type Props = {
  id: string
  title: string
  isSensitive?: boolean
}

/**
 * ブログなどに貼る埋め込みのコード（iframe）をコピーする
 */
export function CopyWorkEmbedButton(props: Props) {
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        createEmbedCode({
          id: props.id,
          title: props.title,
          isAdult: props.isSensitive === true,
        }),
      )
      setIsCopied(true)
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => {
        setIsCopied(false)
      }, 1500)
      toast(
        t(
          "埋め込みコードをコピーしました。ブログなどのHTMLに貼り付けてください。",
          "Embed code copied. Paste it into the HTML of your blog or site.",
        ),
      )
    } catch (err) {
      toast(t("コピーに失敗しました。", "Failed to copy."))
      console.error(err)
    }
  }

  return (
    <Button
      className="flex items-center gap-2"
      variant="outline"
      onClick={handleCopy}
      aria-live="polite"
    >
      {isCopied ? <RiCheckLine /> : <RiCodeSSlashLine />}
      {isCopied
        ? t("コピーしました", "Copied")
        : t("埋め込みコードをコピー", "Copy embed code")}
    </Button>
  )
}
