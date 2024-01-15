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
    <div className="p-4 h-calc(100vh - 72px) w-full flex justify-center items-center">
      <div>
        <p>{props.children ?? "Placeholder"}</p>
      </div>
    </div>
  )
}
