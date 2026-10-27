type Props = {
  settingLanguageUsedForPromptView?: React.ReactNode
  promptEditor: React.ReactNode
  negativePromptEditor: React.ReactNode
  config: React.ReactNode
  submission: React.ReactNode
}

/**
 * PC の左カラム（プロンプト → モデル・設定 の順に縦に並べ、生成ボタンは下に固定）
 */
export function GenerationSettingsColumn(props: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-muted/30">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {props.settingLanguageUsedForPromptView}
        <div>{props.promptEditor}</div>
        <div className="h-40">{props.negativePromptEditor}</div>
        <div>{props.config}</div>
      </div>
      <div className="border-t bg-background/95 p-3 shadow-[0_-4px_12px_-8px_rgba(0,0,0,0.15)] backdrop-blur">
        {props.submission}
      </div>
    </div>
  )
}
