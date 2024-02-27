"use client"

import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"

/**
 * 履歴メモ単体
 * @param props
 * @returns
 */
export const GenerationConfigMemoItem = () => {
  return (
    <>
      <div className="relative items-center flex">
        <Button className="w-full h-16" variant="ghost">
          <div className="text-left absolute left-2">
            <div className="left-2">{"メモ１"}</div>
            <div className="left-2 top-12">{"説明説明説明説明説明"}</div>
          </div>
        </Button>
        <Button className="absolute right-2" variant={"ghost"} size={"icon"}>
          <Trash2Icon className="w-4" />
        </Button>
      </div>
    </>
  )
}
