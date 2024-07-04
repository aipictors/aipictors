import { Input } from "@/_components/ui/input"
import {} from "@/_components/ui/radio-group"
import {} from "@/_components/ui/select"
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
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-background pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">生成情報</p>
          <>
            {/* プロンプト */}
            <p className="mb-1 text-xs">プロンプト</p>
            <Textarea
              onChange={(event) => {
                const pngInfo = props.pngInfo
                pngInfo.params.prompt = event.target.value
                props.setPngInfo(pngInfo)
              }}
              maxLength={10000}
              value={props.pngInfo.params.prompt}
              placeholder={"Prompts"}
              className="mb-2 max-h-24 w-full overflow-y-auto"
            />
            {/* ネガティブプロンプト */}
            <p className="mb-1 text-xs">プロンプト</p>
            <Textarea
              onChange={(event) => {
                const pngInfo = props.pngInfo
                pngInfo.params.prompt = event.target.value
                props.setPngInfo(pngInfo)
              }}
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
                  onChange={(event) => {
                    const pngInfo = props.pngInfo
                    pngInfo.params.seed = event.target.value
                    props.setPngInfo(pngInfo)
                  }}
                  value={props.pngInfo.params.seed}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={"Seed"}
                  className="w-full"
                />
                <Input
                  onChange={(event) => {
                    const pngInfo = props.pngInfo
                    pngInfo.params.steps = event.target.value
                    props.setPngInfo(pngInfo)
                  }}
                  value={props.pngInfo.params.steps}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={"Steps"}
                  className="w-full"
                />
                <Input
                  onChange={(event) => {
                    const pngInfo = props.pngInfo
                    pngInfo.params.scale = event.target.value
                    props.setPngInfo(pngInfo)
                  }}
                  value={props.pngInfo.params.scale}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={"Scale"}
                  className="w-full"
                />
              </div>
              {/* Sampler, Strength, Noise */}
              <div className="flex space-x-1">
                <Input
                  onChange={(event) => {
                    const pngInfo = props.pngInfo
                    pngInfo.params.sampler = event.target.value
                    props.setPngInfo(pngInfo)
                  }}
                  value={props.pngInfo.params.sampler}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={"Sampler"}
                  className="w-full"
                />
                <Input
                  onChange={(event) => {
                    const pngInfo = props.pngInfo
                    pngInfo.params.strength = event.target.value
                    props.setPngInfo(pngInfo)
                  }}
                  value={props.pngInfo.params.strength}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={"Strength"}
                  className="w-full"
                />
                <Input
                  onChange={(event) => {
                    const pngInfo = props.pngInfo
                    pngInfo.params.noise = event.target.value
                    props.setPngInfo(pngInfo)
                  }}
                  value={props.pngInfo.params.noise}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={"Noise"}
                  className="w-full"
                />
              </div>
              {/* ModelHash, Model, */}
              <div className="flex space-x-1">
                <Input
                  onChange={(event) => {
                    const pngInfo = props.pngInfo
                    pngInfo.params.model = event.target.value
                    props.setPngInfo(pngInfo)
                  }}
                  value={props.pngInfo.params.model}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={"Model"}
                  className="w-full"
                />
                <Input
                  onChange={(event) => {
                    const pngInfo = props.pngInfo
                    pngInfo.params.modelHash = event.target.value
                    props.setPngInfo(pngInfo)
                  }}
                  value={props.pngInfo.params.modelHash}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={"ModelHash"}
                  className="w-full"
                />
              </div>
            </div>
            {/* other */}
            <Textarea
              onChange={(event) => {
                const pngInfo = props.pngInfo
                pngInfo.src = event.target.value
                props.setPngInfo(pngInfo)
              }}
              value={props.pngInfo.src}
              maxLength={10000}
              placeholder={"Other"}
              className="w-full"
            />
          </>
        </div>
      </div>
    </>
  )
}
