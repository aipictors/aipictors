import { Button } from "~/components/ui/button"
import { GiftIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  promptonId: string
}

/**
 * 投稿者への支援ボタン
 */
export function PromptonRequestTextButton ({ promptonId, ...rest }: Props) {
  const t = useTranslation()

  const onClick = () => {
    window.open(`https://prompton.io/aipic/${promptonId}`, "_blank")
  }

  return (
    <Button
      className="rounded-full"
      onClick={onClick}
      size={"sm"}
      variant={"secondary"}
      {...rest}
    >
      <div className="flex items-center space-x-2">
        <p>{t("サポート", "Support")}</p>
        <GiftIcon className="w-4" />
      </div>
    </Button>
  )
}
