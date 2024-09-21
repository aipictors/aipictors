import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Share2 } from "lucide-react"
import { CopyWorkUrlButton } from "./work-action-copy-url"
import { XIntent } from "./work-action-share-x"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  title?: string
  isDisabledShare?: boolean
  id: string
}

export function SharePopover(props: Props) {
  const t = useTranslation()
  const currentUrl = `https://www.aipictors.com/works/${props.id}`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="secondary">
          <Share2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">
              {t("作品を共有する", "Share work")}
            </h4>
            {props.isDisabledShare && (
              <p>
                {t(
                  "下書きもしくは予約作品のため、共有できません",
                  "Cannot share draft or scheduled works",
                )}
              </p>
            )}
          </div>
          {!props.isDisabledShare && (
            <div className="grid gap-2">
              <CopyWorkUrlButton currentUrl={currentUrl} />
              <XIntent
                text={`${props.title}\n`}
                url={`${currentUrl}\n`}
                hashtags={["Aipictors", "AIIllust"]}
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
