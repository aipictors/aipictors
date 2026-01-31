type Props = {
  tasks: unknown[]
  isTextView: boolean
  onLoadMore: () => void | Promise<void>
  hasNext: boolean
}

export function ImagineHistoryList (_props: Props) {
  return (
    <div className="p-4">
      <p className="text-muted-foreground">履歴リスト</p>
    </div>
  )
}
