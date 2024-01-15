"use client"

import ReportDialog from "@/app/[lang]/(main)/works/[work]/_components/report-dialog"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DownloadIcon, MoreHorizontal } from "lucide-react"

/**
 * 作品への報告、画像ダウンロードのメニュー
 */
export default function MenuPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"}>
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
