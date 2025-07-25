import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Slider } from "~/components/ui/slider"
import { useEffect } from "react"

type Props = {
  module: string
  weight: number
  isSelectorOpen: boolean
  modelType: string
  setModule: (module: string) => void
  setModel: (model: string) => void
  setWeight: (weight: number) => void
  setIsSelectorOpen: (isSelectorOpen: boolean) => void
}

/**
 * ControlNet設定ダイアログ内容
 */
export function GenerationConfigControlNetDialogContents(props: Props) {
  const isShowWeight = () => {
    return (
      (props.module === "dw_openpose_full" && props.modelType !== "SDXL") ||
      props.module === "openpose_full" ||
      props.module === "openpose" ||
      props.module === "canny" ||
      props.module === "depth_midas" ||
      props.module === "mlsd" ||
      props.module === "softedge_pidinet" ||
      props.module === "scribble_pidinet" ||
      props.module === "reference_only"
    )
  }

  const onChangeModule = (module: string) => {
    props.setModule(module)

    // SDXLモデルの場合
    if (props.modelType === "SDXL") {
      if (module === "openpose_full") {
        props.setModel("diffusion_pytorch_model_twins [590eff90]")
        return
      }
      if (module === "openpose") {
        props.setModel("diffusion_pytorch_model_twins [590eff90]")
        return
      }
      if (module === "canny") {
        props.setModel("diffusers_xl_canny_mid [112a778d]")
        return
      }
      if (module === "depth_midas") {
        props.setModel("diffusers_xl_depth_mid [39c49e13]")
        return
      }
      if (module === "softedge_pidinet") {
        props.setModel("sargezt_xl_softedge [b6f7415b]")
        return
      }
      if (module === "mlsd") {
        props.setModel("bdsqlsz_controlllite_xl_mlsd_V2 [9fb65e46]")
        return
      }
      if (module === "scribble_pidinet") {
        props.setModel("kohya_controllllite_xl_scribble_anime [d39b679a]")
        return
      }
      if (module === "seg_ofade20k") {
        props.setModel(
          "bdsqlsz_controlllite_xl_segment_animeface_V2 [bb3b9e5e]",
        )
        return
      }
      if (module === "reference_only") {
        props.setModel("")
        return
      }
    } else {
      // SD1/SD2モデルの場合（既存の処理）
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
        props.setModel("control_v11p_sd15_canny [d14c016b]")
        return
      }
      if (module === "depth_midas") {
        props.setModel("control_v11f1p_sd15_depth [cfd03158]")
        return
      }
      if (module === "softedge_pidinet") {
        props.setModel("")
        return
      }
      if (module === "mlsd") {
        props.setModel("control_v11p_sd15_mlsd [aca30ff0]")
        return
      }
      if (module === "scribble_pidinet") {
        props.setModel("control_v11p_sd15_scribble [d4ba51ff]")
        return
      }
      if (module === "seg_ofade20k") {
        props.setModel("control_v11p_sd15_seg [e1f51eb9]")
        return
      }
      if (module === "reference_only") {
        props.setModel("")
        return
      }
    }
    props.setModel("")
  }

  // https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/dw_openpose_full.webp
  const getSampleImageUrl = () => {
    if (props.module === "dw_openpose_full") {
      return "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/dw_openpose_full.webp"
    }
    if (props.module === "openpose_full") {
      return "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/dw_openpose_full.webp"
    }
    if (props.module === "openpose") {
      return "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/openpose.webp"
    }
    if (props.module === "canny") {
      return "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/canny.webp"
    }
    if (props.module === "depth_midas") {
      return "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/depth_midas.webp"
    }
    if (props.module === "softedge_pidinet") {
      return "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/softedge_pidinet.webp"
    }
    if (props.module === "mlsd") {
      return "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/mlsd.webp"
    }
    if (props.module === "scribble_pidinet") {
      return "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/scribble_pidinet.webp"
    }
    if (props.module === "seg_ofade20k") {
      return "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/segmentation.webp"
    }
    if (props.module === "reference_only") {
      return "https://legacy.aipictors.com/wp-content/themes/AISite/images/controlnet/reference_only.webp"
    }
    return null
  }

  const sampleImageUrl = getSampleImageUrl()

  useEffect(() => {
    props.setWeight(1)
  }, [])

  return (
    <>
      <Select
        onOpenChange={() => {
          if (props.isSelectorOpen) {
            setTimeout(() => {
              props.setIsSelectorOpen(!props.isSelectorOpen)
            }, 100)
          } else {
            props.setIsSelectorOpen(!props.isSelectorOpen)
          }
        }}
        value={props.module}
        onValueChange={onChangeModule}
      >
        <SelectTrigger>
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {props.modelType !== "SDXL" && (
              <SelectItem value="dw_openpose_full">
                {"DWポーズ(全身、顔、手を同じポーズで生成)"}
              </SelectItem>
            )}
            <SelectItem value="canny">{"Canny(線画抽出)を元に生成"}</SelectItem>
            <SelectItem value="depth_midas">
              {"Depth(深度情報付き)を元に生成"}
            </SelectItem>
            <SelectItem value="softedge_pidinet">
              {"Hed(輪郭抽出)を元に生成"}
            </SelectItem>
            <SelectItem value="mlsd">{"mlsd(直線抽出)を元に生成"}</SelectItem>
            <SelectItem value="scribble_pidinet">
              {"Scribble(ラフ絵)を元に生成"}
            </SelectItem>
            <SelectItem value="seg_ofade20k">
              {"Segmentation(入力画像を領域分け)を元に生成"}
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
              text={"どのくらい参考画像を反映するかです。"}
            />
          </div>

          <div className="flex items-center gap-x-2">
            <Slider
              className="color-pink w-full"
              aria-label="slider-ex-2"
              min={0.1}
              max={2.0}
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

          {sampleImageUrl !== null && (
            <>
              <div className="flex gap-x-2">
                <div className="text-sm">{"サンプル"}</div>
                <CrossPlatformTooltip
                  text={"左：参考画像、中：抽出画像、右：生成画像"}
                />
              </div>
              <img src={sampleImageUrl} className={"w-full"} alt={"-"} />
            </>
          )}
        </>
      )}
    </>
  )
}
