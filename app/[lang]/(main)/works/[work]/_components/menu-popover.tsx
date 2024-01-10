"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Download, Flag } from "lucide-react"
import { RiMoreFill } from "react-icons/ri"
import ReportDialog from "./report-dialog"

/**
 * 作品への報告、画像ダウンロードのメニュー
 */
export default function MenuPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          <RiMoreFill />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Button className="flex items-center gap-2" variant="outline">
              <Download />
              ダウンロード
            </Button>
            <ReportDialog />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
