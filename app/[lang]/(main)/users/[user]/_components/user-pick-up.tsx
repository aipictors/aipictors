"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"

export const UserPickUp = () => {
  return (
    <div className="flex">
      <span>{"Pick Up"}</span>
      <div className="flex">
        <span>{"R18（n）"}</span>
        <Switch />
      </div>
      <div className="flex justify-start">
        <Button aria-label={"追加"} size={"icon"}>
          <Plus />
        </Button>
      </div>
    </div>
  )
}
