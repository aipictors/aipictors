import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover"
import { Link } from "~/lib/app/locale-router"
import { HelpCircleIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  text: string
  detailLink?: string
  isTargetBlank?: boolean
}

/**
 * PCとスマホの両方で使えるホバーカード
 */
export function CrossPlatformTooltip (props: Props): React.ReactNode {
  const t = useTranslation()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <HelpCircleIcon className="w-4" role="button" aria-label={t("ヘルプ", "Help")} />
      </PopoverTrigger>
      <PopoverContent className="whitespace-pre-wrap font-size-md">
        {props.text}
        {props.detailLink && <Link to={props.detailLink}>{t("(詳細)", "(Details)")}</Link>}
      </PopoverContent>
    </Popover>
  )
}
