import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Share2 } from "lucide-react"
import { CopyWorkUrlButton } from "./work-action-copy-url"
import { XIntent } from "./work-action-share-x"

type Props = {
  title?: string
  isDisabledShare?: boolean
  id: string
}

export function SharePopover(props: Props) {
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
            <h4 className="font-medium leading-none">作品を共有する</h4>
            {props.isDisabledShare && (
              <p>下書きもしくは予約作品のため、共有できません</p>
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
              {/* <Button
            disabled
            className="flex items-center gap-2"
            variant="outline"
          >
            <Files />
            イラストをコピー
          </Button> */}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
