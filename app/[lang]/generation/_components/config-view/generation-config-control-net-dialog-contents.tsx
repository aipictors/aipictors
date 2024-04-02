import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { CrossPlatformTooltip } from "@/app/_components/cross-platform-tooltip"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useEffect } from "react"

type Props = {
  module: string
  weight: number
  setModule: (module: string) => void
  setModel: (model: string) => void
  setWeight: (weight: number) => void
}

/**
 * ControlNet設定ダイアログ内容
 * @returns
 */
export const GenerationConfigControlNetDialogContents = (props: Props) => {
  const context = useGenerationContext()

  const isShowWeight = () => {
    return (
      props.module === "reference_only" ||
      "dw_openpose_full" ||
      "openpose_full" ||
      "openpose" ||
      "canny" ||
      "softedge_hed" ||
      "scribble" ||
      "depth_anything"
    )
  }

  const onChangeModule = (module: string) => {
    props.setModule(module)
    if (module === "dw_openpose_full") {
      props.setModel("control_openpose-fp16 [9ca67cc5]")
      return
    }
    if (module === "openpose_full") {
      props.setModel("control_openpose-fp16 [9ca67cc5]")
      return
    }
    if (module === "openpose") {
      props.setModel("control_openpose-fp16 [9ca67cc5]")
      return
    }
    if (module === "canny") {
      props.setModel(null)
      return
    }
    if (module === "depth_anything") {
      props.setModel("control_v11f1p_sd15_depth [cfd03158]")
      return
    }
    if (module === "softedge_hed") {
      props.setModel(null)
      return
    }
    if (module === "mlsd") {
      props.setModel("control_v11p_sd15_mlsd [aca30ff0]")
      return
    }
    if (module === "reference_only") {
      props.setModel(null)
      return
    }
    props.setModel(null)
  }

  useEffect(() => {
    props.setWeight(1)
  }, [])

  return (
    <>
      <Select value={props.module} onValueChange={onChangeModule}>
        <SelectTrigger>
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="dw_openpose_full">
              {"DWポーズ(全身、顔、手を同じポーズで生成)"}
            </SelectItem>
            <SelectItem value="openpose_full">
              {"Openpose full(全身、顔、手を同じポーズで生成(棒人間))"}
            </SelectItem>
            <SelectItem value="openpose">
              {"Openpose(全身を同じポーズで生成(棒人間))"}
            </SelectItem>
            <SelectItem value="canny">{"Canny(線画抽出)を元に生成"}</SelectItem>
            <SelectItem value="depth_anything">
              {"Depth(深度情報付き)を元に生成"}
            </SelectItem>
            <SelectItem value="softedge_hed">
              {"Hed(輪郭抽出)を元に生成"}
            </SelectItem>
            <SelectItem value="mlsd">{"mlsd(直線抽出)を元に生成"}</SelectItem>
            <SelectItem value="scribble">
              {"Scribble(ラフ絵)を元に生成"}
            </SelectItem>
            <SelectItem value="reference_only">
              {"Reference Only(同じ絵柄を引き継いで生成)"}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {isShowWeight() && (
        <>
          <div className="flex gap-x-2">
            <div className="text-sm">{"比重"}</div>
            <CrossPlatformTooltip
              text={"どのくらい参考画像を反映するか、0.5あたりが推奨です。"}
            />
          </div>

          <div className="flex items-center gap-x-2">
            <Slider
              className="color-pink w-full"
              aria-label="slider-ex-2"
              min={0.1}
              max={1.0}
              step={0.1}
              defaultValue={[1]}
              value={[props.weight]}
              onValueChange={(value) => props.setWeight(value[0])}
            />
            <Input
              type="number"
              value={props.weight ? props.weight.toFixed(1) : 1.0}
              className="w-20 font-bold"
              min={-1}
              max={1}
              disabled={false}
              onChange={(event) => {
                if (
                  Number(event.target.value) >= 0 &&
                  Number(event.target.value) <= 1
                ) {
                  props.setWeight(Number(event.target.value))
                }
              }}
            />
          </div>
        </>
      )}
    </>
  )
}
