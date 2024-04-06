type Props = {
  children?: React.ReactNode
}

/**
 * 開発用の仮のページ
 * @param props
 * @returns
 */
export const AppPlaceholder = (props: Props) => {
  return (
    <div className="- 72px) flex h-calc(100vh w-full items-center justify-center p-4">
      <div>
        <p>{props.children ?? "Placeholder"}</p>
      </div>
    </div>
  )
}
