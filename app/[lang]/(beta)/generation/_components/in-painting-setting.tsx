import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { RefreshCcwIcon } from "lucide-react"

export const InPaintingSetting = () => {
  return (
    <div className="flex">
      <div className="flex justify-center">
        <Button>
          <RefreshCcwIcon />
        </Button>
      </div>
      <div className="space-y-4">
        <div className="flex">
          <p>{"ブラシサイズ："}</p>
          <Slider
            className="color-pink w-32"
            aria-label="slider-ex-2"
            defaultValue={[50]}
          />
        </div>
        <div className="flex">
          <p>{"画像拡大率："}</p>
          <Slider
            className="color-pink w-32"
            aria-label="slider-ex-2"
            defaultValue={[50]}
          />
        </div>
        <div className="flex">
          <p>{"ノイズ除去強度："}</p>
          <p>{"弱"}</p>
          <Slider
            className="color-pink w-32"
            aria-label="slider-ex-2"
            defaultValue={[50]}
          />
          <p>{"強"}</p>
        </div>
        <div className="flex">
          <p>{"マスク方式："}</p>
          <RadioGroup defaultValue="1">
            <div className="flex-col space-x-5">
              <RadioGroupItem value="default" id="r1" />
              <Label className="color-blue" htmlFor="r1">
                {"塗りつぶし"}
              </Label>
            </div>
            <div className="flex-col space-x-5">
              <RadioGroupItem value="comfortable" id="r2" />
              <Label className="color-blue" htmlFor="r2">
                {" もとに近い"}
              </Label>
            </div>
            <div className="flex-col space-x-5">
              <RadioGroupItem value="compact" id="r3" />
              <Label className="color-blue" htmlFor="r3">
                {"もとから大きく変更"}
              </Label>
            </div>
            <div className="flex-col space-x-5">
              <RadioGroupItem value="compact" id="r4" />
              <Label className="color-blue" htmlFor="r4">
                {"ほぼ変えない"}
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
