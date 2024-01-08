"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useSearchParams } from "next/navigation"
import {
  RiFacebookLine,
  RiFileCopyLine,
  RiShareFill,
  RiTwitterXLine,
} from "react-icons/ri"

export default function Component() {
  const handleCopyUrl = async () => {
    try {
      const currentUrl = window.location.href
      await navigator.clipboard.writeText(currentUrl)
      alert("URLがコピーされました")
    } catch (err) {
      console.error("URLのコピーに失敗しました", err)
    }
  }

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
            <h4 className="font-medium leading-none">このイラストを共有する</h4>
          </div>
          <div className="grid gap-2">
            <Button
              className="flex items-center gap-2"
              variant="outline"
              onClick={handleCopyUrl}
            >
              <RiFileCopyLine />
              Copy URL
            </Button>
            <Button className="flex items-center gap-2" variant="outline">
              <RiTwitterXLine />
              Share on Twitter
            </Button>
            <Button className="flex items-center gap-2" variant="outline">
              <RiFacebookLine />
              Share on Facebook
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
