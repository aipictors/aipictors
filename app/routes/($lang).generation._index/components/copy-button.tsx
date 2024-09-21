import { Button } from "~/components/ui/button"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  text: string
  className?: string
  disabled?: boolean
}

export function CopyButton(props: Props) {
  const t = useTranslation()

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(props.text)
      .then(() => {
        toast(t("クリップボードにコピーされました", "Copied to clipboard"))
      })
      .catch((err) => {
        console.error(
          t(
            "クリップボードへのコピーに失敗しました:",
            "Failed to copy to clipboard",
          ),
          err,
        )
      })
  }

  return (
    <Button
      variant={"secondary"}
      disabled={props.disabled}
      size={"sm"}
      className={`${
        props.className
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
      } m-0 pad-16 w-full whitespace-normal`}
      onClick={copyToClipboard}
    >
      <p className="break-all text-left">{t("コピー", "Copy")}</p>
    </Button>
  )
}
