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
      <Input type="text" placeholder="タイトル" />
      <Input type="text" placeholder="説明（省略可）" />
      <Textarea placeholder="プロンプト">{context.config.promptText}</Textarea>
      <Input
        type="text"
        value={context.config.negativePromptText}
        placeholder="ネガティブプロンプト"
      />
      <Input type="number" value={context.config.steps} placeholder="Steps" />
      <Input type="number" value={context.config.scale} placeholder="Scale" />
      <Input type="number" value={context.config.seed} placeholder="Seeds" />
    </>
  )
}
