"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Files, Share2 } from "lucide-react"
import { usePathname } from "next/navigation"
import CopyWorkUrlButton from "./work-action-copy-url"
import { XIntent } from "./work-action-share-x"

type Props = {
  title?: string
}

export const SharePopover = (props: Props) => {
  const currentUrl = `${process.env.NEXT_PUBLIC_APP_URL}${usePathname()}`

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
            <h4 className="font-medium leading-none">イラストを共有する</h4>
          </div>
          <div className="grid gap-2">
            <CopyWorkUrlButton currentUrl={currentUrl} />
            <XIntent
              text={`${props.title}\n`}
              url={`${currentUrl}\n`}
              hashtags={["Aipictors", "AIIllust"]}
            />
            <Button
              disabled
              className="flex items-center gap-2"
              variant="outline"
            >
              <Files />
              イラストをコピー
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
