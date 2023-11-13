"use client"

import { Button } from "@/components/ui/button"
import React from "react"

type Props = {
  name: string
  onClick(): void
}

export const MutedTag: React.FC<Props> = (props) => {
  return (
    <div className="flex justify-between">
      <div>
        <p>{props.name}</p>
      </div>
      <Button className="rounded-full px-4 py-2" onClick={props.onClick}>
        {"解除"}
      </Button>
    </div>
  )
}
