import { Button } from "@/_components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover"
import ReportDialog from "@/routes/($lang)._main.works.$work/_components/report-dialog"
import { DownloadIcon, MoreHorizontal } from "lucide-react"

/**
 * 作品への報告、画像ダウンロードのメニュー
 */
export default function MenuPopover() {
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
            <Button className="flex items-center gap-2" variant="outline">
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
