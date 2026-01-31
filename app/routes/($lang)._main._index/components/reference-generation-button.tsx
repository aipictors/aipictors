import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { ImageIcon } from "lucide-react"

type Props = {
  workId: string
  className?: string
}

/**
 * 参照生成ボタン
 */
export function ReferenceGenerationButton (props: Props) {
  const t = useTranslation()

  const handleClick = () => {
    window.location.href = `/generation?work=${props.workId}`
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      className={`w-full ${props.className}`}
      onClick={handleClick}
    >
      <ImageIcon className="mr-2 size-4" />
      {t("参照生成", "Reference Generate")}
    </Button>
  )
}
