"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const MyStickers = () => {
  return (
    <div className="flex">
      <div className="flex flex-col">
        <p className="text-2xl">{"作成済みスタンプ"}</p>
        <div className="flex">
          <Button>
            <Plus />
            <p>{"新しいスタンプ"}</p>
          </Button>
        </div>
      </div>
    </div>
  )
}
