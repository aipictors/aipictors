type Props = Readonly<{
  children?: React.ReactNode
}>

/**
 * 開発用の仮のページ
 */
export function AppPlaceholder (props: Props): React.ReactNode {
  return (
    <div className="- 72px) flex h-calc(100vh w-full items-center justify-center p-4">
      <div>
        <p>{props.children ?? "Placeholder"}</p>
      </div>
    </div>
  )
}
