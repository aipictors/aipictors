type Props = {
  settingLanguageUsedForPromptView?: React.ReactNode
  negativePromptEditor: React.ReactNode
  config: React.ReactNode
}

/**
 * PC の設定カラム
 */
export function GenerationSettingsColumn(props: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-muted/30">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {props.settingLanguageUsedForPromptView}
        <div className="h-40">{props.negativePromptEditor}</div>
        <div>{props.config}</div>
      </div>
    </div>
  )
}
