import { Button } from "@/_components/ui/button"
import { Card, CardContent } from "@/_components/ui/card"
import { Input } from "@/_components/ui/input"
import { Slider } from "@/_components/ui/slider"
import { XIcon } from "lucide-react"

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
    <Card>
      <CardContent className="flex items-center space-x-2 p-2">
        <img
          className="h-16 w-16 rounded object-cover"
          src={props.imageURL ?? ""}
          alt={props.name}
          draggable={false}
        />
        <div className="flex w-full flex-col gap-y-1 overflow-hidden">
          <div className="flex flex-col">
            <div className="flex items-center gap-x-2">
              <p className="whitespace-pre-wrap font-bold text-lg">
                {props.name}
              </p>
              <Button
                className="ml-auto"
                size={"icon"}
                variant={"ghost"}
                onClick={props.onDelete}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>

            <p className="whitespace-pre-wrap text-sm">{props.description}</p>
          </div>
          <div className="flex items-center gap-x-2">
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
            <Input
              type="number"
              value={props.value.toFixed(2)}
              className="w-20 font-bold"
              min={-1}
              max={1}
              onChange={(event) => {
                props.setValue(Number(event.target.value))
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
