"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePathname } from "next/navigation"
import { RiFileCopyLine, RiShareFill } from "react-icons/ri"
import { toast } from "sonner"
import CopyWorkUrlButton from "./copy-work-url"
import { XIntent } from "./share-on-x"

type Props = {
  title?: string
}

export const SharePopover = (props: Props) => {
  const currentUrl = `https://www.aipictors.com${usePathname()}`

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
            <CopyWorkUrlButton currentUrl={currentUrl} />
            <XIntent
              text={`${props.title}\n`}
              url={`${currentUrl}\n`}
              hashtags={["Aipictors", "AIIllust"]}
            />
            <Button
              className="flex items-center gap-2"
              variant="outline"
              onClick={() => {
                toast("開発中につき、未実装")
              }}
            >
              <RiFileCopyLine />
              イラストをコピー
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
