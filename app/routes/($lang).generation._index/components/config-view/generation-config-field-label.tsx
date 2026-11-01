type Props = {
  label: string
  /**
   * 範囲など（例: 1-15）
   */
  range?: string
  /**
   * 初めての人向けのひとこと（ツールチップではなく常に見せる）
   */
  hint?: string
}

/**
 * 詳細設定の各項目の見出し
 */
export function GenerationConfigFieldLabel(props: Props) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline gap-x-2">
        <span className="font-bold text-sm">{props.label}</span>
        {props.range && (
          <span className="text-muted-foreground text-xs">({props.range})</span>
        )}
      </div>
      {props.hint && (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {props.hint}
        </p>
      )}
    </div>
  )
}
