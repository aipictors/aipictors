import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

type Props = {
  onChangeMaskType(value: string): void
  onChangeDenoisingStrengthSize(value: string): void
}

export const InPaintingSetting = (props: Props) => {
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChangeMaskType(event.target.value)
  }
  const handleStrengthSizeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    props.onChangeDenoisingStrengthSize(event.target.value)
  }

  props.onChangeMaskType("1")
  props.onChangeDenoisingStrengthSize("0.5")

  return (
    <div className="flex">
      <div className="space-y-4">
        <div className="flex">
          <p>{"ノイズ除去強度："}</p>
          <p>{"弱"}</p>
          <Slider
            onChange={handleStrengthSizeChange}
            className="color-pink w-32"
            aria-label="slider-ex-2"
            max={1}
            min={0.1}
            step={0.1}
            defaultValue={[0.5]}
          />
          <p>{"強"}</p>
        </div>
        <div>
          <p>{"マスク方式："}</p>
          <RadioGroup onChange={handleRadioChange} defaultValue="0">
            <div className="flex">
              <div className="w-48 flex-col space-x-5">
                <RadioGroupItem value="0" id="r1" />
                <Label className="color-blue" htmlFor="r1">
                  {"塗りつぶし"}
                </Label>
              </div>
              <div className="w-48 flex-col space-x-5">
                <RadioGroupItem value="1" id="r2" />
                <Label className="color-blue" htmlFor="r2">
                  {"もとに近い"}
                </Label>
              </div>
            </div>
            <div className="flex">
              <div className="w-48 flex-col space-x-5">
                <RadioGroupItem value="2" id="r3" />
                <Label className="color-blue" htmlFor="r3">
                  {"もとから大きく変更"}
                </Label>
              </div>
              <div className="w-48 flex-col space-x-5">
                <RadioGroupItem value="3" id="r4" />
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
