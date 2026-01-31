import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import type { PNGInfo } from "~/utils/get-extract-info-from-png"
import { Card, CardContent } from "~/components/ui/card"
import { useState } from "react"
import { ExpansionTransition } from "~/components/expansion-transition"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation" // useTranslationをインポート

type Props = {
  pngInfo: PNGInfo | null
  setPngInfo: (value: PNGInfo | null) => void
}

/**
 * 生成パラメータ入力
 */
export function PostFormItemGenerationParams (props: Props) {
  const t = useTranslation() // 翻訳フックの使用

  const handleChange = (field: keyof PNGInfo["params"], value: string) => {
    if (!props.pngInfo) return

    const updatedPngInfo = {
      ...props.pngInfo,
      params: {
        ...props.pngInfo?.params,
        [field]: value,
      },
    }
    props.setPngInfo(updatedPngInfo)
  }

  const handleSrcChange = (value: string) => {
    if (!props.pngInfo) return

    const updatedPngInfo = {
      ...props.pngInfo,
      src: value,
    }
    props.setPngInfo(updatedPngInfo)
  }

  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardContent className="flex flex-col space-y-4 pt-4 pb-4">
        <ExpansionTransition
          triggerChildren={
            <Button variant={"secondary"} className="w-full">
              {t("生成情報", "Generation Info")}
              {isExpanded ? t("を閉じる", "Close") : t("を開く", "Expand")}
            </Button>
          }
          onExpandChange={setIsExpanded}
        >
          <div className="flex flex-col space-y-4">
            <p className="text-xs">{t("プロンプト", "Prompt")}</p>
            <Textarea
              onChange={(event) => handleChange("prompt", event.target.value)}
              maxLength={10000}
              value={props.pngInfo?.params?.prompt ?? ""}
              placeholder={t("Prompts", "Prompts")}
              className="max-h-24 w-full overflow-y-auto"
            />
            {/* ネガティブプロンプト */}
            <p className="text-xs">
              {t("ネガティブプロンプト", "Negative Prompt")}
            </p>
            <Textarea
              onChange={(event) =>
                handleChange("negativePrompt", event.target.value)
              }
              value={props.pngInfo?.params?.negativePrompt ?? ""}
              maxLength={10000}
              placeholder={t("Negative Prompts", "Negative Prompts")}
              className="max-h-24 w-full overflow-y-auto"
            />
            {/* Seed, Steps, Scale */}
            <p className="text-xs">{t("詳細", "Details")}</p>
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-2">
                <Input
                  onChange={(event) => handleChange("seed", event.target.value)}
                  value={props.pngInfo?.params?.seed ?? ""}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={t("Seed", "Seed")}
                  className="w-full"
                />
                <Input
                  onChange={(event) =>
                    handleChange("steps", event.target.value)
                  }
                  value={props.pngInfo?.params?.steps ?? ""}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={t("Steps", "Steps")}
                  className="w-full"
                />
                <Input
                  onChange={(event) =>
                    handleChange("scale", event.target.value)
                  }
                  value={props.pngInfo?.params?.scale ?? ""}
                  minLength={6}
                  maxLength={100}
                  type="text"
                  placeholder={t("Scale", "Scale")}
                  className="w-full"
                />
              </div>
              <div className="flex space-x-2">
                <Input
                  onChange={(event) =>
                    handleChange("sampler", event.target.value)
                  }
                  value={props.pngInfo?.params?.sampler ?? ""}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={t("Sampler", "Sampler")}
                  className="w-full"
                />
                <Input
                  onChange={(event) =>
                    handleChange("strength", event.target.value)
                  }
                  value={props.pngInfo?.params?.strength ?? ""}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={t("Strength", "Strength")}
                  className="w-full"
                />
                <Input
                  onChange={(event) =>
                    handleChange("noise", event.target.value)
                  }
                  value={props.pngInfo?.params?.noise ?? ""}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={t("Noise", "Noise")}
                  className="w-full"
                />
              </div>
              <div className="flex space-x-2">
                <Input
                  onChange={(event) =>
                    handleChange("model", event.target.value)
                  }
                  value={props.pngInfo?.params?.model ?? ""}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={t("Model", "Model")}
                  className="w-full"
                />
                <Input
                  onChange={(event) =>
                    handleChange("modelHash", event.target.value)
                  }
                  value={props.pngInfo?.params?.modelHash ?? ""}
                  minLength={1}
                  maxLength={100}
                  type="text"
                  placeholder={t("Model Hash", "Model Hash")}
                  className="w-full"
                />
              </div>
            </div>
            <Textarea
              onChange={(event) => handleSrcChange(event.target.value)}
              value={props.pngInfo?.src ?? ""}
              maxLength={10000}
              placeholder={t("Other", "Other")}
              className="w-full"
            />
          </div>
        </ExpansionTransition>
      </CardContent>
    </Card>
  )
}
