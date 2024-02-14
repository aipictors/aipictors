"use client"

import { Button } from "@/components/ui/button"

type Props = {
  name: string
  onClick(): void
}

export const MutedTag = (props: Props) => {
  return (
    <div className="flex justify-between">
      <div>
        <p>{props.name}</p>
      </div>
      <Button className="rounded-full p-4" onClick={props.onClick}>
        {"解除"}
      </Button>
    </div>
  )
}
