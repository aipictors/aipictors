import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
export const InPaintingSetting = () => {
  return (
    <div className="flex">
      <div className="space-y-4">
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
        <div>
          <p>{"マスク方式："}</p>
          <RadioGroup defaultValue="1">
            <div className="flex">
              <div className="flex-col space-x-5 w-48">
                <RadioGroupItem value="default" id="r1" />
                <Label className="color-blue" htmlFor="r1">
                  {"塗りつぶし"}
                </Label>
              </div>
              <div className="flex-col space-x-5 w-48">
                <RadioGroupItem value="comfortable" id="r2" />
                <Label className="color-blue" htmlFor="r2">
                  {"もとに近い"}
                </Label>
              </div>
            </div>
            <div className="flex">
              <div className="flex-col space-x-5 w-48">
                <RadioGroupItem value="compact" id="r3" />
                <Label className="color-blue" htmlFor="r3">
                  {"もとから大きく変更"}
                </Label>
              </div>
              <div className="flex-col space-x-5 w-48">
                <RadioGroupItem value="unchanged" id="r4" />
                <Label className="color-blue" htmlFor="r4">
                  {"ほぼ変えない"}
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}
