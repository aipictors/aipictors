"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Flag } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const MenuDropdown = (props: Props) => {
  return (
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
        <DropdownMenuItem className=" space-x-2 ">
          <Flag />
          <span>{"報告"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className=" space-x-2 ">
          <Download />
          <span>{"PNGダウンロード"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
