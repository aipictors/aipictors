"use client"

import { ReportDialog } from "@/app/[lang]/(main)/works/[work]/_components/report-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Flag } from "lucide-react"
import { useBoolean } from "usehooks-ts"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const MenuDropdown = (props: Props) => {
  const {
    value: isReportOpen,
    setTrue: onReportOpen,
    setFalse: onReportClose,
  } = useBoolean()

  return (
    <>
      <DropdownMenu
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            props.onClose()
          }
        }}
        open={props.isOpen}
      >
        <DropdownMenuTrigger />
        <DropdownMenuContent>
          <DropdownMenuItem className=" space-x-2 " onClick={onReportOpen}>
            <Flag />
            <span>{"報告"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className=" space-x-2 ">
            <Download />
            <span>{"PNGダウンロード"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ReportDialog isOpen={isReportOpen} onClose={onReportClose} />
    </>
  )
}
