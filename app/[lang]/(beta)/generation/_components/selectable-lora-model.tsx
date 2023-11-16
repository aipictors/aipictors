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

export const SelectableLoraModel = (props: Props) => {
  return (
    <div className="space-x-2 flex">
      <Button
        className="overflow-hidden"
        variant={"outline"}
        // borderColor={"gray.200"}
      >
        <img
          className="rounded-md w-full max-w-[4rem] object-cover"
          src={props.imageURL ?? ""}
          alt={props.name}
          draggable={false}
        />
      </Button>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex flex-col">
          <p className="text-lg font-bold whitespace-pre-wrap">{props.name}</p>
          <p className="text-sm whitespace-pre-wrap">{props.description}</p>
        </div>
        <div className="flex flex-col">
          <div className="flex">
            <Slider
              aria-label="slider-ex-2"
              defaultValue={[props.value]}
              min={-1}
              max={1}
              step={0.01}
              onChange={() => props.setValue(props.value)}
            />
            <div className="flex">
              <p>{props.value.toFixed(2)}</p>
            </div>
          </div>
          <Button onClick={props.onDelete}>{"削除"}</Button>
        </div>
      </div>
    </div>
  )
}
