"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2Icon } from "lucide-react"

export const ViewerAlbum = () => {
  return (
    <Card>
      <Button>
        <img src="https://source.unsplash.com/random/800x600" alt="" />
      </Button>
      <div className="flex">
        <p>{"タイトル"}</p>
        <Trash2Icon />
      </div>
    </Card>
  )
}
