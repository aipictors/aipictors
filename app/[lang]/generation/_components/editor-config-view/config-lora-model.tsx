"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

type Props = {
  imageURL: string
  name: string
  description: string
  value: number
  setValue(value: number): void
  onDelete(): void
}

export const ConfigLoraModel = (props: Props) => {
  return (
    <div className="space-x-2 flex">
      <img
        className="rounded w-16 object-cover"
        src={props.imageURL ?? ""}
        alt={props.name}
        draggable={false}
      />
      <div className="flex flex-col w-full gap-y-1 overflow-hidden">
        <div className="flex flex-col">
          <p className="text-lg font-bold whitespace-pre-wrap">{props.name}</p>
          <p className="text-sm whitespace-pre-wrap">{props.description}</p>
        </div>
        <div className="flex gap-x-2 items-center">
          <Slider
            aria-label="slider-ex-2"
            defaultValue={[props.value]}
            min={-1}
            max={1}
            step={0.1}
            onValueChange={(value) => {
              props.setValue(value[0])
            }}
          />
          <span className="font-bold">{props.value.toFixed(2)}</span>
        </div>
        <Button size={"sm"} variant={"secondary"} onClick={props.onDelete}>
          {"削除"}
        </Button>
      </div>
    </div>
  )
}
