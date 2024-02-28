"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

/**
 * 履歴メモ保存コンテンツ
 * @param props
 * @returns
 */
export const GenerationConfigMemoSavingContent = () => {
  const context = useGenerationContext()

  return (
    <>
      {"タイトル"}
      <Input type="text" placeholder="タイトル" />
      {"説明（省略可）"}
      <Input type="text" placeholder="説明（省略可）" />
      {"プロンプト"}
      <Textarea placeholder="プロンプト">{context.config.promptText}</Textarea>
      {"ネガティブプロンプト"}
      <Input
        type="text"
        value={context.config.negativePromptText}
        placeholder="ネガティブプロンプト"
      />
      <div className="flex items-center space-x-2">
        <div>
          {"Steps"}
          <Input
            type="number"
            value={context.config.steps}
            placeholder="Steps"
          />
        </div>
        <div>
          {"Scale"}
          <Input
            type="number"
            value={context.config.scale}
            placeholder="Scale"
          />
        </div>
        <div>
          {"Seeds"}
          <Input
            type="number"
            value={context.config.seed}
            placeholder="Seeds"
          />
        </div>
      </div>
    </>
  )
}
