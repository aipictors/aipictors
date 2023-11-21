"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "lucide-react"
import { TbBrandX } from "react-icons/tb"

type Props = {
  isOpen: boolean
  onClose(): void
}

export const ShareDropdown = (props: Props) => {
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
          <TbBrandX />
          <span>{"X"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className=" space-x-2 ">
          <Link />
          <span>{"リンク"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
