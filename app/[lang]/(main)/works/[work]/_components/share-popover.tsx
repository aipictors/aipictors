"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { RiFileCopyLine, RiShareFill, RiTwitterXLine } from "react-icons/ri"
import { toast } from "sonner"

export default function Component() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <RiShareFill />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">イラストを共有する</h4>
          </div>
          <div className="grid gap-2">
            <Button
              className="flex items-center gap-2"
              variant="outline"
              onClick={async () => {
                try {
                  const currentUrl = window.location.href
                  await navigator.clipboard.writeText(currentUrl)
                  toast("URLがクリップボードにコピーされました。")
                } catch (err) {
                  toast("URLのコピーに失敗しました。")
                }
              }}
            >
              <RiFileCopyLine />
              Copy URL
            </Button>
            <Button className="flex items-center gap-2" variant="outline">
              <RiTwitterXLine />
              Share on Twitter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
