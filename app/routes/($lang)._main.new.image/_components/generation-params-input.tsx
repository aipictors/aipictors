import { Input } from "@/_components/ui/input"
import { Textarea } from "@/_components/ui/textarea"
import type { PNGInfo } from "@/_utils/get-extract-info-from-png"

type Props = {
  pngInfo: PNGInfo
  setPngInfo: (value: PNGInfo | null) => void
}

/**
 * 生成パラメータ入力
 */
export const GenerationParamsInput = (props: Props) => {
  const handleChange = (field: keyof PNGInfo["params"], value: string) => {
    const updatedPngInfo = {
      ...props.pngInfo,
      params: {
        ...props.pngInfo.params,
        [field]: value,
      },
    }
    props.setPngInfo(updatedPngInfo)
  }

  const handleSrcChange = (value: string) => {
    const updatedPngInfo = {
      ...props.pngInfo,
      src: value,
    }
    props.setPngInfo(updatedPngInfo)
  }

  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-secondary pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">生成情報</p>
          <p className="mb-1 text-xs">プロンプト</p>
          <Textarea
            onChange={(event) => handleChange("prompt", event.target.value)}
            maxLength={10000}
            value={props.pngInfo.params.prompt}
            placeholder={"Prompts"}
            className="mb-2 max-h-24 w-full overflow-y-auto"
          />
          {/* ネガティブプロンプト */}
          <p className="mb-1 text-xs">ネガティブプロンプト</p>
          <Textarea
            onChange={(event) =>
              handleChange("negativePrompt", event.target.value)
            }
            value={props.pngInfo.params.negativePrompt}
            maxLength={10000}
            placeholder={"NegativePrompts"}
            className="max-h-24 w-full overflow-y-auto"
          />
          {/* Seed, Steps, Scale */}
          <p className="mt-2 mb-1 text-xs">詳細</p>
          <div className="mb-1 space-y-1">
            <div className="flex space-x-1">
              <Input
                onChange={(event) => handleChange("seed", event.target.value)}
                value={props.pngInfo.params.seed}
                minLength={1}
                maxLength={100}
                type="text"
                placeholder={"Seed"}
                className="w-full"
              />
              <Input
                onChange={(event) => handleChange("steps", event.target.value)}
                value={props.pngInfo.params.steps}
                minLength={1}
                maxLength={100}
                type="text"
                placeholder={"Steps"}
                className="w-full"
              />
              <Input
                onChange={(event) => handleChange("scale", event.target.value)}
                value={props.pngInfo.params.scale}
                minLength={1}
                maxLength={100}
                type="text"
                placeholder={"Scale"}
                className="w-full"
              />
            </div>
            <div className="flex space-x-1">
              <Input
                onChange={(event) =>
                  handleChange("sampler", event.target.value)
                }
                value={props.pngInfo.params.sampler}
                minLength={1}
                maxLength={100}
                type="text"
                placeholder={"Sampler"}
                className="w-full"
              />
              <Input
                onChange={(event) =>
                  handleChange("strength", event.target.value)
                }
                value={props.pngInfo.params.strength}
                minLength={1}
                maxLength={100}
                type="text"
                placeholder={"Strength"}
                className="w-full"
              />
              <Input
                onChange={(event) => handleChange("noise", event.target.value)}
                value={props.pngInfo.params.noise}
                minLength={1}
                maxLength={100}
                type="text"
                placeholder={"Noise"}
                className="w-full"
              />
            </div>
            <div className="flex space-x-1">
              <Input
                onChange={(event) => handleChange("model", event.target.value)}
                value={props.pngInfo.params.model}
                minLength={1}
                maxLength={100}
                type="text"
                placeholder={"Model"}
                className="w-full"
              />
              <Input
                onChange={(event) =>
                  handleChange("modelHash", event.target.value)
                }
                value={props.pngInfo.params.modelHash}
                minLength={1}
                maxLength={100}
                type="text"
                placeholder={"ModelHash"}
                className="w-full"
              />
            </div>
          </div>
          <Textarea
            onChange={(event) => handleSrcChange(event.target.value)}
            value={props.pngInfo.src}
            maxLength={10000}
            placeholder={"Other"}
            className="w-full"
          />
        </div>
      </div>
    </>
  )
}
