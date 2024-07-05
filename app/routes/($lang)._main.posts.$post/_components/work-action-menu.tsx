import { Button } from "@/_components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover"
import { ReportDialog } from "@/routes/($lang)._main.posts.$post/_components/report-dialog"
import { DownloadIcon, MoreHorizontal } from "lucide-react"

type Props = {
  onDownload: () => void
}

/**
 * 作品への報告、画像ダウンロードのメニュー
 */
export function MenuPopover(props: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant="secondary">
          <MoreHorizontal />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Button
              onClick={props.onDownload}
              className="flex items-center gap-2"
              variant="outline"
            >
              <DownloadIcon />
              ダウンロード
            </Button>
            <ReportDialog />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
