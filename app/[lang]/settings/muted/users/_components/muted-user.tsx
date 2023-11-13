"use client"

import { Button } from "@/components/ui/button"

type Props = {
  name: string
  iconImageURL: string | null
  onClick(): void
}

export const MutedUser = (props: Props) => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center">
        <div className="bg-teal-500 w-8 h-8 rounded-full overflow-hidden">
          <img
            src={props.iconImageURL ?? undefined}
            alt={props.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-2">
          <p>{props.name}</p>
        </div>
      </div>
      <Button className="rounded-full px-4 py-2" onClick={props.onClick}>
        {"解除"}
      </Button>
    </div>
  )
}
